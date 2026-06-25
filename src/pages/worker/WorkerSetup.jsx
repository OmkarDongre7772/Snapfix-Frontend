import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { setupWorkerProfileApi } from "../../api/workerApi";
import { useGeolocation } from "../../hooks/useGeolocation";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";

const SKILL_SUGGESTIONS = [
  "Plumbing", "Electrical", "Masonry", "Carpentry",
  "Road Repair", "Painting", "Welding", "Cleaning",
];

export default function WorkerSetup() {
  const navigate = useNavigate();
  const geo      = useGeolocation();
  const { refreshUser } = useAuth();

  const [skills,   setSkills]   = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [lat,      setLat]      = useState("");
  const [lng,      setLng]      = useState("");
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);

  // ── Geo fill ─────────────────────────────────────────────────────
  if (geo.lat && lat !== String(geo.lat)) {
    setLat(String(geo.lat)); setLng(String(geo.lng));
  }

  // ── Skill tag management ─────────────────────────────────────────
  const addSkill = (val) => {
    const s = val.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };

  const removeSkill = (s) => setSkills((prev) => prev.filter((x) => x !== s));

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); }
    if (e.key === "Backspace" && !skillInput) setSkills((prev) => prev.slice(0, -1));
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = {};
    if (skills.length === 0) errs.skills = "Add at least one skill.";
    if (!lat || isNaN(lat))  errs.lat    = "Valid latitude required.";
    if (!lng || isNaN(lng))  errs.lng    = "Valid longitude required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await setupWorkerProfileApi(skills, Number(lat), Number(lng));
      await refreshUser();
      navigate("/worker/home");
    } catch (err) {
      setApiError(err.response?.data?.message ?? "Setup failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="text-4xl mb-3">🔧</div>
          <h2 className="text-2xl font-semibold text-text">Complete your worker profile</h2>
          <p className="text-sm text-text-muted mt-1">Tell us your skills and current location to start discovering jobs.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* Skills */}
          <Card padding="sm">
            <p className="field-label mb-2">Your skills</p>
            <div className={`flex flex-wrap gap-2 min-h-[42px] rounded border p-2 transition-colors
                             ${errors.skills ? "border-danger" : "border-border"}`}>
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent-light text-accent text-sm font-medium">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-accent-hover" aria-label={`Remove ${s}`}>✕</button>
                </span>
              ))}
              <input
                id="skill-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={() => skillInput && addSkill(skillInput)}
                placeholder={skills.length ? "" : "Type a skill, press Enter…"}
                className="flex-1 min-w-24 bg-transparent text-sm text-text outline-none placeholder:text-text-subtle"
              />
            </div>
            {errors.skills && <p className="text-xs text-danger mt-1">{errors.skills}</p>}

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => addSkill(s)}
                  className="text-xs px-2 py-1 rounded border border-border text-text-muted hover:border-accent hover:text-accent transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </Card>

          {/* Location */}
          <Card padding="sm">
            <p className="field-label mb-3">Your current location</p>
            <Button
              type="button" variant="secondary" size="sm"
              loading={geo.loading}
              onClick={geo.fetch}
              id="worker-detect-location-btn"
              className="mb-3"
            >
              {geo.loading ? "Detecting…" : "📍 Detect my location"}
            </Button>
            {geo.error && <p className="text-xs text-danger mb-3">{geo.error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Input id="worker-lat" label="Latitude" type="number" step="any"
                value={lat} onChange={(e) => setLat(e.target.value)} error={errors.lat} />
              <Input id="worker-lng" label="Longitude" type="number" step="any"
                value={lng} onChange={(e) => setLng(e.target.value)} error={errors.lng} />
            </div>
          </Card>

          {apiError && (
            <div role="alert" className="rounded border border-danger-light bg-danger-light px-3 py-2 text-sm text-danger">
              {apiError}
            </div>
          )}

          <Button type="submit" id="worker-setup-submit-btn" loading={loading} fullWidth size="lg">
            Save profile &amp; start working
          </Button>
        </form>
      </div>
    </div>
  );
}
