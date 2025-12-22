import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { contactApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, HelpCircle } from 'lucide-react';

const ContactSupportDialog = ({ triggerText = "Contact Support", className }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        query: ''
    });
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await contactApi.submitQuery(formData);
            toast({
                title: "Query Sent",
                description: "We have received your message and will get back to you shortly.",
                className: "bg-emerald-500 text-white border-none"
            });
            setOpen(false);
            setFormData({ name: '', email: '', phone: '', query: '' });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to send query. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button type="button" className={className || "text-emerald-400 hover:underline"}>
                    {triggerText}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <HelpCircle className="w-5 h-5 text-emerald-500" />
                        Contact Support
                    </DialogTitle>
                    <DialogDescription>
                        Have a question or need assistance? Fill out the form below and our team will help you out.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                        <Input
                            id="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Optional"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="query" className="text-sm font-medium">Message</label>
                        <Textarea
                            id="query"
                            placeholder="How can we help you?"
                            value={formData.query}
                            onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                            required
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ContactSupportDialog;
