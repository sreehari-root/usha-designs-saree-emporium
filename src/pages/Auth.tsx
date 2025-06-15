import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

export default function Auth() {
  const { signIn, signUp, resetPassword, user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const resetParam = searchParams.get('reset');
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [resetError, setResetError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(
    resetParam === 'true' ? 'reset' : (tabParam === 'signup' ? 'signup' : 'login')
  );

  useEffect(() => {
    // Check for password recovery session in URL hash - this must happen FIRST
    const checkForPasswordRecovery = async () => {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken && refreshToken) {
        console.log('Password recovery URL detected, showing reset form');
        try {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (!error && data.session) {
            setShowPasswordReset(true);
            // Clear the URL hash
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            return;
          }
        } catch (error) {
          console.error('Error setting recovery session:', error);
        }
      }
    };

    checkForPasswordRecovery();
    
    // Update active tab when URL params change
    if (resetParam === 'true' && !showPasswordReset) {
      setActiveTab('reset');
    } else {
      setActiveTab(tabParam === 'signup' ? 'signup' : 'login');
    }
  }, [tabParam, resetParam, showPasswordReset]);

  // Only redirect if user is logged in AND we're not in password reset flow
  if (user && !showPasswordReset) {
    return <Navigate to="/" />;
  }

  // Show password reset form if we're in recovery mode
  if (showPasswordReset) {
    return (
      <div className="container flex items-center justify-center py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 border-b-2 border-usha-burgundy w-16 mx-auto"></div>
            <h1 className="text-3xl font-serif font-medium text-gray-800">Reset Your Password</h1>
            <p className="text-gray-600 mt-2">Enter your new password below</p>
          </div>
          <PasswordResetForm onBack={() => setShowPasswordReset(false)} />
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (!error) {
        navigate('/');
      }
    } catch (error: any) {
      setLoginError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupError('');
    
    // Validate passwords match
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await signUp(signupEmail, signupPassword, firstName, lastName);
      if (!error) {
        // Switch to login tab after successful signup
        setActiveTab('login');
      }
    } catch (error: any) {
      setSignupError(error.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResetError('');
    
    try {
      const { error } = await resetPassword(resetEmail);
      if (!error) {
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error: any) {
      setResetError(error.message || 'An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowForgotPassword(false);
    // Update URL to reflect tab change
    if (value === 'signup') {
      navigate('/auth?tab=signup');
    } else if (value === 'reset') {
      navigate('/auth?reset=true');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="container flex items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 border-b-2 border-usha-burgundy w-16 mx-auto"></div>
          <h1 className="text-3xl font-serif font-medium text-gray-800">Welcome to Usha Designs</h1>
          <p className="text-gray-600 mt-2">Sign in to access your account or create a new one</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="reset">Reset Password</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              {!showForgotPassword ? (
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                      Enter your email and password to access your account
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {loginError && (
                      <div className="text-sm font-medium text-destructive">{loginError}</div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="example@email.com" 
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <button 
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-usha-burgundy hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input 
                        id="login-password" 
                        type="password" 
                        required 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-usha-burgundy hover:bg-usha-burgundy/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </CardFooter>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>
                      Enter your email address and we'll send you a password reset link
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {resetError && (
                      <div className="text-sm font-medium text-destructive">{resetError}</div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        placeholder="example@email.com" 
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-usha-burgundy hover:bg-usha-burgundy/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Enter your details to create your account
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {signupError && (
                    <div className="text-sm font-medium text-destructive">{signupError}</div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input 
                        id="first-name" 
                        placeholder="John" 
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input 
                        id="last-name" 
                        placeholder="Doe" 
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="example@email.com" 
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-usha-burgundy hover:bg-usha-burgundy/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="reset">
            <Card>
              <form onSubmit={handleForgotPassword}>
                <CardHeader>
                  <CardTitle>Reset Your Password</CardTitle>
                  <CardDescription>
                    Enter your email address and we'll send you a password reset link
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {resetError && (
                    <div className="text-sm font-medium text-destructive">{resetError}</div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="reset-tab-email">Email</Label>
                    <Input 
                      id="reset-tab-email" 
                      type="email" 
                      placeholder="example@email.com" 
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-usha-burgundy hover:bg-usha-burgundy/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-usha-burgundy hover:underline">Terms of Service</a> and{" "}
            <a href="/privacy" className="text-usha-burgundy hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
