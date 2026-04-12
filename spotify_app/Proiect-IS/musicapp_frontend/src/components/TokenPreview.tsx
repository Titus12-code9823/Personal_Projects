interface TokenPreviewProps {
  token: string | null;
}

const TokenPreview = ({ token }: TokenPreviewProps) => {
  if (!token) {
    return (
      <div className="token-preview token-preview--empty">
        <p>Nu există un token activ încă.</p>
      </div>
    );
  }

  const snippet = `${token.slice(0, 20)}...${token.slice(-10)}`;

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(token);
    } catch {
      // swallow clipboard errors silently
    }
  };

  return (
    <div className="token-preview">
      <div>
        <p className="token-preview__label">Token JWT curent</p>
        <code className="token-preview__value">{snippet}</code>
      </div>
      <button type="button" className="btn btn--ghost" onClick={handleCopy}>
        Copiază
      </button>
    </div>
  );
};

export default TokenPreview;

