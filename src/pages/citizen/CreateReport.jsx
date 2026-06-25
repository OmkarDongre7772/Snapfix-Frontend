import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReportApi } from "../../api/reportApi";
import { useGeolocation } from "../../hooks/useGeolocation";
import { CATEGORIES } from "../../components/CategoryBadge";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/Card";
import Spinner from "../../components/Spinner";

const MAX_DESC = 1000;

export default function CreateReport() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);
  const geo      = useGeolocation();

  const [form, setForm] = useState({
    description: "",
    category: "",
    lat: "",
    lng: "",
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors,       setErrors]       = useState({});
  const [apiError,     setApiError]     = useState("");
  const [submitting,   setSubmitting]   = useState(false);

  // ── Geo auto-fill ────────────────────────────────────────────────
  const handleDetect = async () => {
    geo.fetch();
  };

  useEffect(() => {
    if (geo.lat && form.lat !== String(geo.lat)) {
      setForm((f) => ({ ...f, lat: String(geo.lat), lng: String(geo.lng) }));
    }
  }, [geo.lat, geo.lng, form.lat]);

  // ── Image pick ───────────────────────────────────────────────────
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  // ── Field change ─────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // ── Validate ─────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!imageFile)                     e.image       = "Please attach an image.";
    if (!form.description.trim())       e.description = "Description is required.";
    if (form.description.length > MAX_DESC) e.description = `Max ${MAX_DESC} characters.`;
    if (!form.category)                 e.category    = "Please select a category.";
    if (!form.lat || isNaN(form.lat))   e.lat         = "Valid latitude required.";
    if (!form.lng || isNaN(form.lng))   e.lng         = "Valid longitude required.";
    return e;
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    fd.append("image",       imageFile);
    fd.append("description", form.description.trim());
    fd.append("category",    form.category);
    fd.append("lat",         form.lat);
    fd.append("lng",         form.lng);

    setSubmitting(true);
    try {
      const { data } = await createReportApi(fd);
      navigate(`/citizen/reports/${data.id}`, {
        replace: true,
        state: { message: data.message },
      });
    } catch (err) {
      setApiError(err.response?.data?.message ?? "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 animate-slide-up">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-text-muted hover:text-text transition-colors flex items-center gap-1 mb-4"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-semibold text-text">Report an issue</h2>
        <p className="text-sm text-text-muted mt-1">Help your community by reporting civic problems.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* ── Image upload ─────────────────────────────────────── */}
        <Card padding="sm">
          <p className="field-label mb-3">Photo evidence</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            id="report-image"
            onChange={handleImage}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md border border-border"
              />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80"
                aria-label="Remove image"
              >✕</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full h-36 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2
                          text-text-muted hover:border-accent hover:text-accent transition-colors
                          ${errors.image ? "border-danger text-danger" : "border-border"}`}
            >
              <span className="text-3xl">📷</span>
              <span className="text-sm font-medium">Click to upload photo</span>
              <span className="text-xs">JPEG, PNG, WEBP up to 10 MB</span>
            </button>
          )}
          {errors.image && <p className="text-xs text-danger mt-1">{errors.image}</p>}
        </Card>

        {/* ── Category picker ──────────────────────────────────── */}
        <div>
          <p className="field-label mb-2">Category</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(CATEGORIES).map(([value, { label, icon }]) => (
              <button
                key={value}
                type="button"
                id={`cat-${value.toLowerCase()}`}
                onClick={() => { setForm((f) => ({ ...f, category: value })); setErrors((e) => ({ ...e, category: "" })); }}
                className={[
                  "flex items-center gap-2 px-3 py-2.5 rounded border text-sm font-medium transition-all duration-150 focus-ring",
                  form.category === value
                    ? "border-accent bg-accent-light text-accent ring-1 ring-accent"
                    : "border-border bg-surface text-text hover:border-text-muted",
                ].join(" ")}
              >
                <span aria-hidden="true">{icon}</span> {label}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
        </div>

        {/* ── Description ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="report-desc" className="field-label mb-0">Description</label>
            <span className={`text-xs ${form.description.length > MAX_DESC ? "text-danger" : "text-text-muted"}`}>
              {form.description.length}/{MAX_DESC}
            </span>
          </div>
          <textarea
            id="report-desc"
            name="description"
            rows={4}
            maxLength={MAX_DESC + 10}
            placeholder="Describe the issue clearly — location details, severity, etc."
            value={form.description}
            onChange={handleChange}
            className={`input-base resize-none ${errors.description ? "border-danger" : ""}`}
          />
          {errors.description && <p className="text-xs text-danger mt-1">{errors.description}</p>}
        </div>

        {/* ── Location ─────────────────────────────────────────── */}
        <Card padding="sm">
          <p className="field-label mb-3">Location</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={geo.loading}
            onClick={handleDetect}
            id="detect-location-btn"
            className="mb-3"
          >
            {geo.loading ? "Detecting…" : "📍 Use my current location"}
          </Button>
          {geo.error && <p className="text-xs text-danger mb-3">{geo.error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="report-lat"
              label="Latitude"
              name="lat"
              type="number"
              step="any"
              placeholder="18.5204"
              value={form.lat}
              onChange={handleChange}
              error={errors.lat}
            />
            <Input
              id="report-lng"
              label="Longitude"
              name="lng"
              type="number"
              step="any"
              placeholder="73.8567"
              value={form.lng}
              onChange={handleChange}
              error={errors.lng}
            />
          </div>
        </Card>

        {apiError && (
          <div role="alert" className="rounded border border-danger-light bg-danger-light px-3 py-2 text-sm text-danger">
            {apiError}
          </div>
        )}

        <Button type="submit" id="submit-report-btn" loading={submitting} fullWidth size="lg">
          Submit report
        </Button>

      </form>
    </main>
  );
}
