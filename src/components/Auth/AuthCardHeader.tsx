import ThemeToggleButton from "@/components/Layout/ThemeToggleButton";

const AuthCardHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-2xl font-semibold"
        aria-label="App Name">
        SnapCircle
      </span>
      <ThemeToggleButton />
    </div>
  );
};

export default AuthCardHeader;
