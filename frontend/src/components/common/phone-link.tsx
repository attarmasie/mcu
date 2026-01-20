import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPhoneForWhatsApp } from "@/lib/formatters";
import { MessageCircle, Phone } from "lucide-react";

interface PhoneLinkProps {
  phone: string;
  className?: string;
}

export function PhoneLink({ phone, className }: PhoneLinkProps) {
  const whatsappNumber = formatPhoneForWhatsApp(phone);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          className={`h-auto p-0 text-sm font-medium text-primary hover:underline ${className}`}
        >
          {phone}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild>
          <a href={`tel:${phone}`} className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Call
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
