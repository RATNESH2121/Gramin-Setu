import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, ArrowRight, Phone, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import ContactSupportDialog from '@/components/ContactSupportDialog';

const Register = () => {
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
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isAdminRegister, setIsAdminRegister] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!otpSent) {
                // Send OTP
                await authApi.sendOtp({
                    phone: formData.phone,
                    email: formData.email,
                    isRegister: true
                });
                setOtpSent(true);
                toast({ title: "OTP Sent", description: "Verifying your email." });
            } else {
                // Verify & Register
                await authApi.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    village: formData.village,
                    district: formData.district,
                    adminSecret: isAdminRegister ? formData.adminSecret : undefined,
                    otp: otp // Send OTP for verification
                });
                toast({ title: "Account Created!", description: "You can now login." });
                navigate('/login');
            }
        } catch (err) {
            toast({
                title: "Error",
                description: err.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-20 flex items-center justify-center min-h-screen">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-md mx-auto">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-4">
                                <span className="text-primary text-3xl">🌾</span>
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">
                                Create Account
                            </h1>
                            <p className="text-muted-foreground">
                                Join GraminSetu today
                            </p>
                        </div>

                        {/* Form Card */}
                        <div className="bg-card backdrop-blur-lg rounded-2xl p-8 border border-border shadow-lg">

                            <div className="flex gap-2 mb-6">
                                <Link to="/login" className="flex-1 py-3 rounded-lg text-sm font-medium transition-all bg-muted text-muted-foreground hover:text-foreground text-center">
                                    Login
                                </Link>
                                <div className="flex-1 py-3 rounded-lg text-sm font-medium transition-all bg-primary text-primary-foreground text-center">
                                    Register
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="pl-12 h-12"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="pl-12 h-12"
                                            required
                                        />
                                    </div>
                                    {otpSent && (
                                        <div className="relative animate-in fade-in slide-in-from-top-2">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="Enter 6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="pl-12 h-12 border-green-500 focus:ring-green-500"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="pl-12 h-12"
                                            required
                                            disabled={otpSent} // Lock email during verification
                                        />
                                    </div>
                                    {!isAdminRegister && !otpSent && (
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <Input
                                                placeholder="Village"
                                                value={formData.village || ''}
                                                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                                className="h-12"
                                                required
                                            />
                                            <Input
                                                placeholder="District"
                                                value={formData.district || ''}
                                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                                className="h-12"
                                                required
                                            />
                                        </div>
                                    )}
                                    {!otpSent && (
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Set Password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="pl-12 h-12 pr-12"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-2 mt-4 px-1">
                                        <input
                                            type="checkbox"
                                            id="admin-toggle"
                                            checked={isAdminRegister}
                                            onChange={(e) => setIsAdminRegister(e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                        />
                                        <label htmlFor="admin-toggle" className="text-sm text-muted-foreground select-none cursor-pointer">
                                            Register as Admin
                                        </label>
                                    </div>
                                    {isAdminRegister && (
                                        <div className="relative mt-4">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                placeholder="Admin Secret Key"
                                                value={formData.adminSecret}
                                                onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                                                className="pl-12 h-12"
                                                required={isAdminRegister}
                                            />
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" variant="default" size="lg" className="w-full gap-2" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Please wait...
                                        </>
                                    ) : (
                                        <>
                                            {otpSent ? 'Complete Registration' : 'Verify Email'}
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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Register;
