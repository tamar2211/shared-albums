import { useState } from "react";

export function useSelection() {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    function toggle(id: number) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function selectAll(ids: number[]) {
        setSelectedIds(new Set(ids));
    }

    function clear() {
        setSelectedIds(new Set());
    }

    return { selectedIds, toggle, selectAll, clear, count: selectedIds.size };
}