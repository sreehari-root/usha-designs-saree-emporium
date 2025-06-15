
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetFormProps {
  recoveryTokens: {
    access_token: string;
    refresh_token: string;
  };
  onBack: () => void;
}

export default function PasswordResetForm({ recoveryTokens, onBack }: PasswordResetFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // First, set the session with the recovery tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: recoveryTokens.access_token,
        refresh_token: recoveryTokens.refresh_token
      });

      if (sessionError) {
        setError('Invalid or expired recovery link. Please request a new password reset.');
        setIsLoading(false);
        return;
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        toast({
          title: "Password updated successfully",
          description: "You can now sign in with your new password.",
        });
        
        // Sign out the user so they have to log in with new password
        await supabase.auth.signOut();
        navigate('/auth');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handlePasswordUpdate}>
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input 
              id="new-password" 
              type="password" 
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full bg-usha-burgundy hover:bg-usha-burgundy/90"
            disabled={isLoading}
          >
            {isLoading ? 'Updating Password...' : 'Update Password'}
          </Button>
          <Button 
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            Back to Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
