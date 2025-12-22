import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, ArrowRight, Phone, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import ContactSupportDialog from '@/components/ContactSupportDialog';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    village: '',
    district: '',
    role: 'farmer',
    adminSecret: '',
  });
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isAdminRegister, setIsAdminRegister] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reset form when switching modes
  useEffect(() => {
    setOtpSent(false);
    setOtp('');
    setErrors({});
  }, [isLogin]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    // Email Validation (Common for both)
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password Validation (Common for both)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      // Registration Specific Validations
      if (!formData.name.trim()) newErrors.name = 'Full Name is required';

      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Phone must be exactly 10 digits';
      }

      if (!isAdminRegister) {
        if (!formData.village.trim()) newErrors.village = 'Village is required';
        if (!formData.district.trim()) newErrors.district = 'District is required';
      }

      if (isAdminRegister && !formData.adminSecret) {
        newErrors.adminSecret = 'Admin Secret Key is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted errors.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await authApi.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast({
          title: "Welcome Back!",
          description: "You have successfully logged in.",
          className: "bg-emerald-500 text-white border-none"
        });
        navigate(data.user.role === 'admin' ? '/admin' : '/farmer');
      } else {
        if (!otpSent) {
          await authApi.sendOtp({
            phone: formData.phone,
            email: formData.email,
            isRegister: true
          });
          setOtpSent(true);
          toast({ title: "OTP Sent", description: "Please check your registered email." });
        } else {
          await authApi.register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            village: formData.village,
            district: formData.district,
            adminSecret: isAdminRegister ? formData.adminSecret : undefined,
            otp: otp
          });
          toast({ title: "Account Created!", description: "Registration successful. Please login." });
          setIsLogin(true);
        }
      }
    } catch (err) {
      toast({
        title: "Authentication Failed",
        description: err.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center">
      <Navbar />

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px]" />
      </div>

      <main className="relative z-10 w-full max-w-md px-4 pt-20 pb-12">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/20 flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-4xl filter drop-shadow-md">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join GraminSetu'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Access your intelligent farming dashboard' : 'Empowering Rural India through Technology'}
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Glossy sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

          {/* Tab Switcher */}
          <div className="flex bg-muted p-1 rounded-xl mb-6 relative">
            <div
              className={`absolute inset-y-1 w-[calc(50%-4px)] bg-emerald-500 rounded-lg transition-all duration-300 shadow-lg ${isLogin ? 'left-1' : 'left-[calc(50%+4px)]'}`}
            />
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg relative z-10 transition-colors ${isLogin ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg relative z-10 transition-colors ${!isLogin ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isLogin ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Email Address</label>
                  <div className="relative group/input">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-destructive' : 'text-muted-foreground group-focus-within/input:text-primary'}`} />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      className={`pl-12 h-12 bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all ${errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 ml-1 animate-pulse">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
                  <div className="relative group/input">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-destructive' : 'text-muted-foreground group-focus-within/input:text-primary'}`} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      className={`pl-12 h-12 bg-background text-foreground placeholder:text-muted-foreground rounded-xl transition-all pr-12 ${errors.password ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 ml-1 animate-pulse">{errors.password}</p>}
                  <div className="text-right">
                    <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="space-y-1">
                    <div className="relative group/input">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.name ? 'text-destructive' : 'text-muted-foreground group-focus-within/input:text-primary'}`} />
                      <Input
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: null });
                        }}
                        className={`pl-10 h-11 bg-background text-foreground placeholder:text-muted-foreground rounded-xl ${errors.name ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}`}
                        required
                      />
                    </div>
                    {errors.name && <p className="text-[10px] text-red-400 ml-1">{errors.name}</p>}
                  </div>
                  {/* Phone */}
                  <div className="space-y-1">
                    <div className="relative group/input">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.phone ? 'text-destructive' : 'text-muted-foreground group-focus-within/input:text-primary'}`} />
                      <Input
                        type="tel"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: val });
                          if (errors.phone) setErrors({ ...errors, phone: null });
                        }}
                        className={`pl-10 h-11 bg-background text-foreground placeholder:text-muted-foreground rounded-xl ${errors.phone ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}`}
                        required
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] text-red-400 ml-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <div className="relative group/input">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-destructive' : 'text-muted-foreground group-focus-within/input:text-primary'}`} />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      className={`pl-12 h-11 bg-background text-foreground placeholder:text-muted-foreground rounded-xl ${errors.email ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}`}
                      required
                      disabled={otpSent}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email}</p>}
                </div>

                {/* OTP Field - Shows only after sending */}
                {otpSent && (
                  <div className="relative animate-in zoom-in-95 duration-200">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-12 h-11 bg-emerald-900/20 border-emerald-500/50 text-white placeholder:text-emerald-600 focus:border-emerald-400 focus:ring-emerald-500/30 rounded-xl tracking-widest font-bold text-center"
                      maxLength={6}
                      required
                    />
                  </div>
                )}

                {/* Location Fields - Hide on OTP send */}
                {!isAdminRegister && !otpSent && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Input
                        placeholder="Village"
                        value={formData.village || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, village: e.target.value });
                          if (errors.village) setErrors({ ...errors, village: null });
                        }}
                        className={`h-11 bg-background text-foreground placeholder:text-muted-foreground rounded-xl ${errors.village ? 'border-destructive' : 'border-input focus:border-primary'}`}
                        required
                      />
                      {errors.village && <p className="text-[10px] text-red-400 ml-1">{errors.village}</p>}
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="District"
                        value={formData.district || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, district: e.target.value });
                          if (errors.district) setErrors({ ...errors, district: null });
                        }}
                        className={`h-11 bg-background text-foreground placeholder:text-muted-foreground rounded-xl ${errors.district ? 'border-destructive' : 'border-input focus:border-primary'}`}
                        required
                      />
                      {errors.district && <p className="text-[10px] text-red-400 ml-1">{errors.district}</p>}
                    </div>
                  </div>
                )}

                {/* Password - Hide on OTP send */}
                {!otpSent && (
                  <div className="space-y-1">
                    <div className="relative group/input">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-destructive' : 'text-muted-foreground group-focus-within/input:text-primary'}`} />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create Password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: null });
                        }}
                        className={`pl-12 h-11 bg-background text-foreground placeholder:text-muted-foreground rounded-xl pr-12 ${errors.password ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}`}
                        required
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password}</p>}
                  </div>
                )}

                {!otpSent && (
                  <div className="flex items-center space-x-2 px-1 pt-1 opacity-80 hover:opacity-100 transition-opacity">
                    <input
                      type="checkbox"
                      id="admin-toggle"
                      checked={isAdminRegister}
                      onChange={(e) => setIsAdminRegister(e.target.checked)}
                      className="rounded border-slate-600 bg-black/20 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    />
                    <label htmlFor="admin-toggle" className="text-xs text-slate-300 select-none cursor-pointer">
                      Register as Administrator
                    </label>
                  </div>
                )}

                {isAdminRegister && !otpSent && (
                  <div className="space-y-1 animate-in slide-in-from-top-2">
                    <div className="relative">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.adminSecret ? 'text-red-400' : 'text-red-400'}`} />
                      <Input
                        type="password"
                        placeholder="Admin Secret Key"
                        value={formData.adminSecret}
                        onChange={(e) => {
                          setFormData({ ...formData, adminSecret: e.target.value });
                          if (errors.adminSecret) setErrors({ ...errors, adminSecret: null });
                        }}
                        className={`pl-12 h-11 bg-red-900/10 text-white placeholder:text-red-300/50 rounded-xl ${errors.adminSecret ? 'border-red-500 focus:border-red-600' : 'border-red-500/30 focus:border-red-500/50'}`}
                        required={isAdminRegister}
                      />
                    </div>
                    {errors.adminSecret && <p className="text-xs text-red-400 ml-1">{errors.adminSecret}</p>}
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 rounded-xl text-md font-semibold mt-4 transition-all duration-300 hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin
                    ? 'Sign In to Dashboard'
                    : (otpSent ? 'Verify & Create Account' : 'Send Verification OTP')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>


        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8 flex items-center justify-center gap-1">
          Having trouble? <ContactSupportDialog />
        </p>
      </main>
    </div>
  );
};

export default Login;
