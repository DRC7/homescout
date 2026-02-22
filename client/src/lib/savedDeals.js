const KEY = "dealscout_saved_deals";

export function getSavedDeals() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function isDealSaved(id) {
    return getSavedDeals().some((d) => d.id === id)
}

export function saveDeal(deal) {
    const current = getSavedDeals();
    if(current.some((d) => d.id === deal.id)) return;
    const next = [deal, ...current];
    localStorage.setItem(KEY, JSON.stringify(next));
}

export function removeDeal(id) {
    const current = getSavedDeals();
    const next = current.filter((d) => d.id !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
}