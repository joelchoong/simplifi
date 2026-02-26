import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onOpenChange }) => {
    const [type, setType] = useState<string>("feedback");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsSubmitting(true);
        // Mock submission - in a real app this would call an API
        await new Promise((resolve) => setTimeout(resolve, 800));

        toast({
            title: "Feedback sent",
            description: "Thank you for helping us improve SimpliFi!",
        });

        setIsSubmitting(false);
        setMessage("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-foreground">What do you think?</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Feedback Type</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select feedback type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="feedback">General Feedback</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                                <SelectItem value="bug">Report a Bug</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <Textarea
                            placeholder="Tell us what's on your mind... Your input helps us build a better experience."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[120px] resize-none focus-visible:ring-emerald-500"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !message.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                        {isSubmitting ? "Sending..." : "Submit Feedback"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
