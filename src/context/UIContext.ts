import { createContext, useContext } from "react";

export interface Toast {
	id: string;
	message: string;
	type: "success" | "error" | "info";
}

interface UIContextType {
	toasts: Toast[];
	showToast: (message: string, type?: "success" | "error" | "info") => void;
	removeToast: (id: string) => void;
	modalOpen: boolean;
	openModal: () => void;
	closeModal: () => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
	const context = useContext(UIContext);
	if (!context) {
		throw new Error("useUI must be used within UIProvider");
	}
	return context;
};
