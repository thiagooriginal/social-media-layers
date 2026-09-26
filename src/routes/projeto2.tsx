import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EVENTS_DATA } from "../data/events";
import { HomeHojeView } from "../components/projeto2/HomeHojeView";
import { AuthModal } from "../components/AuthModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { getCurrentUser, subscribeToAuth, UserProfile } from "../services/authService";

export const Route = createFileRoute("/projeto2")({
  component: Projeto2Page,
});

function Projeto2Page() {
  const navigate = useNavigate();

  // Autenticação do Usuário
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((newUser) => {
      setUser(newUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#070a11]">
      <HomeHojeView
        events={EVENTS_DATA}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onSwitchToProjeto1={() => navigate({ to: "/" })}
      />

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setUser(getCurrentUser());
        }}
      />

      {/* Modal de Perfil & Passes VIP */}
      {user && (
        <UserProfileModal
          user={user}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={() => {
            setUser(null);
            setIsProfileModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
