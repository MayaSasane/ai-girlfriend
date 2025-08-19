import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle2 } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarName: string;
}

const SubscriptionModal = ({ isOpen, onClose, avatarName }: SubscriptionModalProps) => {
  const features = [
    "Unlimited conversations with all AI girlfriends",
    "Premium voice responses with realistic AI speech",
    "Advanced personality customization",
    "Priority response speed",
    "Exclusive content and scenarios",
    "Memory of your conversations",
    "24/7 access to your companions",
    "New girlfriends added monthly",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-md bg-[#1C1C1E] border-zinc-700 text-white rounded-2xl shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="text-center items-center">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <DialogTitle className="text-2xl font-bold text-white">
              Premium Access
            </DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 text-sm">
            Your free trial with <span className="font-bold text-primary">{avatarName}</span> has ended.
            Unlock unlimited access to continue your intimate conversations.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 my-4">
          {/* Price Box */}
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-white">€30</p>
            <p className="text-sm text-zinc-400">per month</p>
            <p className="text-xs text-green-400 mt-1">Cancel anytime</p>
          </div>

          {/* Features List */}
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-base py-3"
          >
            Unlock Unlimited Access - €30/month
          </Button>
          <p className="text-xs text-zinc-500">
            Secure payment processed by Stripe. Cancel anytime in your account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
