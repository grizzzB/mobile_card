import { useRef, useEffect } from 'react';

interface CollapsibleProps {
    open: boolean;
    children: React.ReactNode;
}

export default function Collapsible({ open, children }: CollapsibleProps) {
    const ref = useRef<HTMLDivElement>(null);
    const animRef = useRef<Animation | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Cancel any in-progress animation
        animRef.current?.cancel();

        const fullHeight = el.scrollHeight + 'px';

        animRef.current = el.animate(
            open
                ? [{ height: '0px' }, { height: fullHeight }]
                : [{ height: fullHeight }, { height: '0px' }],
            { duration: 300, easing: 'ease', fill: 'forwards' }
        );
    }, [open]);

    return (
        <div ref={ref} style={{ overflow: 'hidden', height: '0px' }}>
            {children}
        </div>
    );
}
