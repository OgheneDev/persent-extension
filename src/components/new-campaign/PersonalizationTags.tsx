import { PERSONALIZATION_TAGS } from "../../types/new-campaign";

interface PersonalizationTagsProps {
  field: "subject" | "body";
  onInsertTag: (tag: string, field: "subject" | "body") => void;
}

export function PersonalizationTags({
  field,
  onInsertTag,
}: PersonalizationTagsProps) {
  const tags = PERSONALIZATION_TAGS[field];

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {tags.map((tag) => (
        <button
          key={tag}
          className="nc-tag"
          onClick={() => onInsertTag(tag, field)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
