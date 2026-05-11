import { AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { T, ACCOUNT_STYLES } from "../../constants/accounts";
import { PLAN_ACCOUNT_LIMITS } from "../../types/accounts";
import { useAccounts } from "../../hooks/useAccounts";
import { AccountHeader } from "../../components/accounts/AccountHeader";
import { ProviderButton } from "../../components/accounts/ProviderButton";
import { AccountCard } from "../../components/accounts/AccountCard";
import { EmptyState } from "../../components/accounts/EmptyState";
import { LimitReachedMessage } from "../../components/accounts/LimitReachedMessage";

interface Props {
  onBack: () => void;
  getAccessToken: () => string | null;
}

export default function AccountsView({ onBack, getAccessToken }: Props) {
  const { auth } = useAuth();
  const {
    accounts,
    loading,
    connecting,
    error,
    removing,
    handleConnect,
    disconnect,
  } = useAccounts(getAccessToken);

  const planLimit = PLAN_ACCOUNT_LIMITS[auth.user?.plan ?? "free"];
  const canAddAccount = !loading && accounts.length < planLimit;

  return (
    <div
      className="acc-root"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Sora', sans-serif",
        color: T.textPrimary,
        overflow: "hidden",
      }}
    >
      <style>{ACCOUNT_STYLES}</style>

      <AccountHeader onBack={onBack} />

      {/* Scrollable Content */}
      <div
        className="acc-scroll-container"
        style={{ flex: 1, padding: "22px 10px 22px 0", overflowY: "auto" }}
      >
        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.07)",
              border: `1px solid rgba(248,113,113,0.18)`,
              padding: "10px 14px",
              borderRadius: 10,
              color: T.danger,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 20,
            }}
          >
            <AlertCircle
              size={14}
              strokeWidth={2.5}
              style={{ flexShrink: 0 }}
            />
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <>
            {canAddAccount ? (
              <>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    color: "#475569",
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  Add Provider
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <ProviderButton
                    provider="gmail"
                    isConnecting={connecting !== null}
                    connectingProvider={connecting}
                    onClick={() => handleConnect("gmail")}
                  />
                  <ProviderButton
                    provider="outlook"
                    isConnecting={connecting !== null}
                    connectingProvider={connecting}
                    onClick={() => handleConnect("outlook")}
                  />
                </div>
              </>
            ) : (
              <LimitReachedMessage
                plan={auth.user?.plan ?? "free"}
                limit={planLimit}
              />
            )}

            <div className="acc-divider" />
          </>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "#475569",
            }}
          >
            Connected Accounts
          </label>
          {!loading && accounts.length > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
                background: "rgba(16,185,129,0.1)",
                color: T.accent,
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              {accounts.length}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="acc-shimmer" />
            <div className="acc-shimmer" style={{ opacity: 0.5 }} />
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {accounts.map((a) => (
              <AccountCard
                key={a._id}
                account={a}
                isRemoving={removing === a._id}
                onDisconnect={disconnect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
