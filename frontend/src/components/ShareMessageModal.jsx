import { X, Link, Facebook, Twitter, Mail, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

const ShareMessageModal = ({ isOpen, onClose, message }) => {
  const messageText = message.text || "";
  const messageImage = message.image || "";
  
  const copyToClipboard = () => {
    const text = messageText + (messageImage ? `\n${messageImage}` : "");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
    onClose();
  };

  const shareViaEmail = () => {
    const subject = "Shared Message";
    const body = messageText + (messageImage ? `\n\nImage: ${messageImage}` : "");
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaWhatsApp = () => {
    const text = messageText + (messageImage ? `\n${messageImage}` : "");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareViaTwitter = () => {
    const text = messageText.slice(0, 280);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
  };

  const shareViaFacebook = () => {
    if (messageImage) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(messageImage)}`);
    } else {
      toast.error("Facebook sharing requires an image");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Share Message</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="bg-base-200 p-4 rounded-lg mb-4 max-h-32 overflow-y-auto">
          <p className="text-sm">{messageText}</p>
          {messageImage && (
            <img src={messageImage} alt="message" className="mt-2 rounded max-h-20 object-cover" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={copyToClipboard}
            className="btn btn-outline flex items-center gap-2"
          >
            <Link size={18} />
            Copy Link
          </button>

          <button
            onClick={shareViaEmail}
            className="btn btn-outline flex items-center gap-2"
          >
            <Mail size={18} />
            Email
          </button>

          <button
            onClick={shareViaWhatsApp}
            className="btn btn-outline flex items-center gap-2"
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>

          <button
            onClick={shareViaTwitter}
            className="btn btn-outline flex items-center gap-2"
          >
            <Twitter size={18} />
            Twitter
          </button>

          <button
            onClick={shareViaFacebook}
            className="btn btn-outline flex items-center gap-2 col-span-2"
          >
            <Facebook size={18} />
            Facebook
          </button>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareMessageModal;
