export type WindowStatus = 'up' | 'down' | 'unknown';

export interface Website {
  id: string;
  url: string;
  userId: string;
  disabled: boolean;
  websiteTicks: {
    id: string;
    websiteId: string;
    validatorId: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    latency: number;
  }[];
}

export interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (website: { name: string; url: string; txSignature: string }) => void;
} 