import AppBackdrop from "@/components/Layout/AppBackdrop";
import ThemeProvider from "@/components/Providers/ThemeProvider";
import { geistMono, geistSans, interHeading } from "@/lib/fonts";
import { LayoutProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import "./globals.css";

const RootLayout = ({ children }: LayoutProps) => {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        interHeading.variable,
      )}
      suppressHydrationWarning>
      <body>
        <AppBackdrop />
        <div className="relative z-10">
          <ThemeProvider
            attribute={"class"}
            defaultTheme="system"
            enableSystem={true}>
            {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
