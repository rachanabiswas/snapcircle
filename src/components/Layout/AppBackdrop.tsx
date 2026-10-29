const AppBackdrop = () => {
  return (
    <div
      aria-hidden="true"
      className="bg-background pointer-events-none fixed inset-0 isolate z-0 overflow-hidden select-none">
      <div className="app-backdrop-wash absolute inset-0" />
      <div className="app-backdrop-waves absolute inset-0" />
      <div className="app-backdrop-ripples absolute inset-0" />
      <div className="app-backdrop-grain absolute inset-0" />
    </div>
  );
};

export default AppBackdrop;
