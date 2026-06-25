import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { updateProfileApi } from "../../api/userApi";
import { useGeolocation } from "../../hooks/useGeolocation";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";

export default function CitizenProfile() {
  const { user, refreshUser } = useAuth();
  const geo = useGeolocation();

  const [name, setName] = useState(user?.profile?.name ?? "");
  const [lat, setLat]   = useState(user?.profile?.location?.latitude ?? "");
  const [lng, setLng]   = useState(user?.profile?.location?.longitude ?? "");
  
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");
  const [error, setError]   = useState("");

  useEffect(() => {
    if (geo.lat && lat !== String(geo.lat)) {
      setLat(String(geo.lat));
      setLng(String(geo.lng));
    }
  }, [geo.lat, geo.lng, lat]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    setSaving(true);
    try {
      const payload = { name };
      if (lat && lng) {
        payload.latitude = Number(lat);
        payload.longitude = Number(lng);
      }
      await updateProfileApi(payload);
      await refreshUser();
      setMsg("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 animate-fade-in">
      <div className="mb-6">
        <p className="section-label mb-1">Citizen</p>
        <h2 className="text-2xl font-semibold text-text">Profile Settings</h2>
      </div>

      <Card padding="md">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <Input 
            id="profile-name" label="Full Name" 
            value={name} onChange={(e) => setName(e.target.value)} 
          />

          <div>
            <p className="field-label mb-3">Default Location</p>
            <p className="text-xs text-text-muted mb-3">Your location is used to show nearby reports in your area.</p>
            <Button
              type="button" variant="secondary" size="sm"
              loading={geo.loading} onClick={geo.fetch} className="mb-3"
            >
              {geo.loading ? "Detecting…" : "📍 Detect my location"}
            </Button>
            {geo.error && <p className="text-xs text-danger mb-3">{geo.error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Input id="profile-lat" label="Latitude" type="number" step="any"
                value={lat} onChange={(e) => setLat(e.target.value)} />
              <Input id="profile-lng" label="Longitude" type="number" step="any"
                value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
          </div>

          {msg && <p className="text-sm text-success font-medium">{msg}</p>}
          {error && <p className="text-sm text-danger font-medium">{error}</p>}

          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </Card>
    </main>
  );
}
