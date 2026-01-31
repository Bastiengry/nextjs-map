import "@testing-library/jest-dom";

Object.defineProperty(global, "ResizeObserver", {
  writable: true,
  value: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "fr",
    },
  }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = {
      ...Component.defaultProps,
      t: (key: string) => key,
    };
    return Component;
  },
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));
