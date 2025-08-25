import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewsletterSignup() {
  return (
    <div className="bg-blue-50 rounded-lg p-6">
      <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
      <p className="text-gray-600 mb-4">Get the latest AI detection insights delivered to your inbox.</p>
      <div className="flex gap-2">
        <Input placeholder="Enter your email" />
        <Button>Subscribe</Button>
      </div>
    </div>
  );
}