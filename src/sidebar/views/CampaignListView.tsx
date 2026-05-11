import { useEffect, useState, useCallback } from "react";
import {
  CirclePlus,
  BarChart3,
  Calendar,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Campaign } from "../../types";
import { campaignsApi } from "../../services/api";
import {
  T,
  STATUS_MAP,
  styles,
  globalCss,
} from "../../constants/campaign-list";

interface Props {
  onSelect: (id: string) => void;
  onNew: () => void;
  getAccessToken: () => string | null;
}

const LIMIT = 20;

export default function CampaignListView({
  onSelect,
  onNew,
  getAccessToken,
}: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const fetchCampaigns = useCallback(
    async (cursor?: string) => {
      cursor ? setLoadingMore(true) : setLoading(true);
      setError("");

      try {
        const token = getAccessToken();
        if (!token) throw new Error("Not authenticated");
        const res = await campaignsApi.list(token, { limit: LIMIT, cursor });
        setCampaigns((prev) => (cursor ? [...prev, ...res.data] : res.data));
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
      } catch (err: any) {
        setError(err.message);
      } finally {
        cursor ? setLoadingMore(false) : setLoading(false);
      }
    },
    [getAccessToken],
  );

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (loading) {
    return (
      <div style={styles.center}>
        <Loader2 size={24} className="spin" color={T.accent} />
        <p style={{ ...styles.muted, marginTop: 12 }}>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{globalCss}</style>

      <div style={styles.topRow}>
        <h3 style={styles.heading}>Campaigns</h3>
        <button style={styles.newBtn} onClick={onNew}>
          <CirclePlus size={16} />
          <span>New</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div style={styles.emptyState}>
          <BarChart3
            size={32}
            color={T.textMuted}
            style={{ marginBottom: 12 }}
          />
          <p>No campaigns yet.</p>
          <button onClick={onNew} style={styles.inlineLink}>
            Create your first one
          </button>
        </div>
      ) : (
        <>
          <div style={styles.list}>
            {campaigns.map((c) => {
              const status = STATUS_MAP[c.status] || STATUS_MAP.draft;
              const progress =
                c.totalRecipients > 0
                  ? (c.sentCount / c.totalRecipients) * 100
                  : 0;

              return (
                <div
                  key={c._id}
                  className="campaign-card"
                  style={styles.card}
                  onClick={() => onSelect(c._id)}
                >
                  <div style={styles.cardTop}>
                    <span style={styles.name}>{c.name}</span>
                    <span
                      style={{
                        ...styles.badge,
                        color: status.color,
                        background: status.bg,
                      }}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${progress}%`,
                        background: status.color,
                      }}
                    />
                  </div>

                  <div style={styles.cardBottom}>
                    <div style={styles.metaItem}>
                      <Send size={12} />
                      <span>
                        {c.sentCount} / {c.totalRecipients}
                      </span>
                    </div>
                    <div style={styles.metaItem}>
                      <Calendar size={12} />
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button
              style={styles.loadMoreBtn}
              onClick={() => fetchCampaigns(nextCursor!)}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load more</span>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
