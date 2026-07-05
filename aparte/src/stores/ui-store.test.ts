import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./ui-store";

const get = () => useUIStore.getState();

beforeEach(() => {
  useUIStore.setState({
    selectedProspectId: null,
    selectedPropertyId: null,
    modal: null,
    notifOpen: false,
    accountOpen: false,
    query: "",
  });
});

describe("drawers de détail", () => {
  it("ouvre puis ferme le drawer prospect", () => {
    get().openProspect("p1");
    expect(get().selectedProspectId).toBe("p1");
    get().closeProspect();
    expect(get().selectedProspectId).toBeNull();
  });

  it("ouvre puis ferme le drawer bien", () => {
    get().openProperty("b1");
    expect(get().selectedPropertyId).toBe("b1");
    get().closeProperty();
    expect(get().selectedPropertyId).toBeNull();
  });
});

describe("modale unique", () => {
  it("ouvrir une modale ferme le panneau de notifications", () => {
    useUIStore.setState({ notifOpen: true });
    get().openModal({ type: "prospect", mode: "create" });
    expect(get().modal).toEqual({ type: "prospect", mode: "create" });
    expect(get().notifOpen).toBe(false);
  });

  it("closeModal réinitialise la modale", () => {
    get().openModal({ type: "bien", mode: "edit", entityId: "b2" });
    get().closeModal();
    expect(get().modal).toBeNull();
  });
});

describe("overlays", () => {
  it("ouvrir le compte ferme les notifications", () => {
    useUIStore.setState({ notifOpen: true });
    get().openAccount();
    expect(get().accountOpen).toBe(true);
    expect(get().notifOpen).toBe(false);
  });

  it("bascule les notifications", () => {
    get().toggleNotif();
    expect(get().notifOpen).toBe(true);
    get().toggleNotif();
    expect(get().notifOpen).toBe(false);
  });
});

describe("recherche", () => {
  it("met à jour la requête courante", () => {
    get().setQuery("marc");
    expect(get().query).toBe("marc");
  });
});
