"use client";

import { useState } from "react";

import AppearanceSettings from "@/components/Settings/AppearanceSettings";
import ChangeEmailForm from "@/components/Settings/ChangeEmailForm";
import ChangePasswordForm from "@/components/Settings/ChangePasswordForm";
import DataExportButton from "@/components/Settings/DataExportButton";
import DeleteAccountForm from "@/components/Settings/DeleteAccountForm";
import HelpSection from "@/components/Settings/HelpSection";
import NotificationPrefsForm from "@/components/Settings/NotificationPrefsForm";
import SettingsProfileForm from "@/components/Settings/SettingsProfileForm";
import SettingsSection from "@/components/Settings/SettingsSection";
import type { Gender, NotificationPrefsValues } from "@/lib/zodSchema";

type SettingsStepsProps = {
  user: {
    name: string;
    email: string;
    bio: string;
    gender: Gender;
  };
  prefs: NotificationPrefsValues;
};

const SettingsSteps = ({ user, prefs }: SettingsStepsProps) => {
  const [openStep, setOpenStep] = useState<string | null>("profile");

  const toggle = (id: string) =>
    setOpenStep((current) => (current === id ? null : id));

  return (
    <>
      <SettingsSection
        id="profile"
        step={1}
        title="Profile"
        description="Edit your name, bio, and gender."
        open={openStep === "profile"}
        onToggle={() => toggle("profile")}>
        <SettingsProfileForm
          initialName={user.name}
          initialBio={user.bio}
          initialGender={user.gender}
        />
      </SettingsSection>

      <SettingsSection
        id="email"
        step={2}
        title="Email"
        description={`Current: ${user.email}`}
        open={openStep === "email"}
        onToggle={() => toggle("email")}>
        <ChangeEmailForm currentEmail={user.email} />
      </SettingsSection>

      <SettingsSection
        id="password"
        step={3}
        title="Password"
        description="Changing your password signs out other devices."
        open={openStep === "password"}
        onToggle={() => toggle("password")}>
        <ChangePasswordForm currentEmail={user.email} />
      </SettingsSection>

      <SettingsSection
        id="notifications"
        step={4}
        title="Notifications"
        description="Control in-app like and reply alerts."
        open={openStep === "notifications"}
        onToggle={() => toggle("notifications")}>
        <NotificationPrefsForm initial={prefs} />
      </SettingsSection>

      <SettingsSection
        id="appearance"
        step={5}
        title="Appearance"
        description="Choose light, dark, or follow your system."
        open={openStep === "appearance"}
        onToggle={() => toggle("appearance")}>
        <AppearanceSettings />
      </SettingsSection>

      <SettingsSection
        id="data"
        step={6}
        title="Your data"
        description="Download posts, likes, and notifications as JSON."
        open={openStep === "data"}
        onToggle={() => toggle("data")}>
        <DataExportButton />
      </SettingsSection>

      <SettingsSection
        id="danger"
        step={7}
        title="Danger zone"
        description="Permanently delete your account and all posts."
        open={openStep === "danger"}
        onToggle={() => toggle("danger")}
        cardClassName="border-destructive/40"
        titleClassName="text-destructive">
        <DeleteAccountForm />
      </SettingsSection>

      <SettingsSection
        id="help"
        step={8}
        title="Help & support"
        description="SnapCircle v2.0.0 — resources and policies."
        open={openStep === "help"}
        onToggle={() => toggle("help")}>
        <HelpSection />
      </SettingsSection>
    </>
  );
};

export default SettingsSteps;
