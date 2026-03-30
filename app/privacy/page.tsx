import { BackToHome } from "@/components/BackToHome";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <BackToHome />

      <h1 className="text-3xl font-semibold tracking-tight mb-6">
        Privacy Policy
      </h1>
      <p className="text-foreground/70 leading-relaxed mb-6">
        This Privacy Policy explains how SlabPixel Quotes collects, uses,
        and shares information. This is a template and may need legal review
        before publishing.
      </p>

      <section className="space-y-6 text-foreground/80">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-medium">Account data:</span> name, email, and
              authentication-related profile data.
            </li>
            <li>
              <span className="font-medium">Profile data:</span> bio, profile
              name, and optional profile photo.
            </li>
            <li>
              <span className="font-medium">Quote submissions:</span> quote
              text, attribution, optional social handles/links, and optional
              backgrounds.
            </li>
            <li>
              <span className="font-medium">Uploads:</span> custom background images
              and profile photos (if provided).
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            2. How We Use Information
          </h2>
          <p className="leading-relaxed">
            We use the information above to operate the service, display
            content, generate visual cards, enable sharing, and moderate
            submissions for safety and quality.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            3. Background and Photo Storage
          </h2>
          <p className="leading-relaxed mb-2">
            If you upload a background or profile photo, the file is stored
            using third-party storage and may be publicly accessible so it
            can be rendered in quote cards and your profile.
          </p>
          <p className="leading-relaxed">
            In the SlabPixel Quotes app, uploads are handled via server
            endpoints and stored through a blob storage provider.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            4. Sharing With Third Parties
          </h2>
          <p className="leading-relaxed">
            We may share limited information with service providers that help
            us operate the platform, such as authentication and storage
            providers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            5. Data Retention
          </h2>
          <p className="leading-relaxed">
            We keep your submissions and profile data for as long as your
            account remains active and for as long as necessary to operate the
            service. You can update your profile name and photo and edit your
            bio from your profile page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            6. Your Choices
          </h2>
          <p className="leading-relaxed">
            You can update your profile information in the app. For requests
            related to deletion or removal of content, contact support.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            7. Security
          </h2>
          <p className="leading-relaxed">
            We use reasonable technical and organizational measures designed to
            protect information. No method of transmission or storage is
            completely secure.
          </p>
        </div>
      </section>
    </main>
  );
}
