import { BackToHome } from "@/components/BackToHome";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <BackToHome />

      <h1 className="text-3xl font-semibold tracking-tight mb-6">
        Terms and Conditions
      </h1>
      <p className="text-foreground/70 leading-relaxed mb-6">
        These Terms and Conditions (“Terms”) govern your use of SlabPixel
        Quotes. By accessing or using the service, you agree to these Terms.
        This is a template for your application and is not legal advice.
      </p>

      <section className="space-y-6 text-foreground/80">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            1. Your Account
          </h2>
          <p className="leading-relaxed">
            You may be required to sign in using an authentication provider
            before submitting quotes or managing your profile. You are
            responsible for maintaining the security of your account.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            2. User Content (Quotes, Social Handles, and Images)
          </h2>
          <p className="leading-relaxed mb-2">
            When you submit a quote, you represent that you have the rights to
            submit it for display on the service and that it does not violate
            any applicable laws or third-party rights.
          </p>
          <p className="leading-relaxed mb-2">
            You may also upload optional background images for your card and
            may set a profile name and profile photo in your profile.
          </p>
          <p className="leading-relaxed">
            By submitting content, you grant SlabPixel Quotes a license to host,
            display, process, and transform your content for the purpose of
            operating the service (including generating visual cards and share
            previews).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            3. Acceptable Use
          </h2>
          <p className="leading-relaxed">
            You agree not to misuse the service, including attempting to
            circumvent technical restrictions, uploading content that infringes
            intellectual property rights, or posting unlawful, harmful, or
            abusive content.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            4. Moderation and Removal
          </h2>
          <p className="leading-relaxed">
            Submissions may be reviewed, curated, or moderated. We may remove
            or disable access to content that we believe violates these Terms or
            applicable law.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            5. Background and Photo Storage
          </h2>
          <p className="leading-relaxed">
            If you upload a background image for a quote or a profile photo,
            those files are stored using third-party storage and may be
            publicly accessible so they can be rendered in cards and on your
            profile.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            6. Changes to These Terms
          </h2>
          <p className="leading-relaxed">
            We may update these Terms from time to time. Continued use of the
            service after changes means you accept the updated Terms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            7. Disclaimer
          </h2>
          <p className="leading-relaxed">
            The service is provided “as is” and “as available.” To the
            maximum extent permitted by law, we disclaim all warranties.
          </p>
        </div>
      </section>
    </main>
  );
}
