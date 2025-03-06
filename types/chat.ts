import Role from "@/app/enums/role";

export interface Message {
  role: Role;
  content: string;
}

export interface ChatMessage extends Message {
  id: number;
  timestamp: Date;
}

export interface SuggestedQuestion {
  id: number;
  text: string;
  icon?: JSX.Element;
}
