<?php

namespace App\Support;

/**
 * Versioned tele-mental health informed-consent document.
 *
 * Implements MoH Tele-Mental Health Guideline 4 (Informed Consent): the
 * client must be informed of the structure, risks, limits, privacy,
 * recording, mandatory reporting and billing of tele-services, in plain
 * language, and the acceptance must be documented before therapy.
 *
 * Bump VERSION whenever the text changes — past acceptances remain on
 * record against the version the user actually agreed to, and users are
 * re-prompted to accept the new version.
 */
class TelehealthConsent
{
    public const VERSION = '2021.1';

    public static function document(): array
    {
        $body = self::body();

        return [
            'type'    => 'telehealth',
            'version' => self::VERSION,
            'title'   => 'Tele-Mental Health Informed Consent',
            'body'    => $body,
            'hash'    => hash('sha256', self::VERSION . '|' . $body),
        ];
    }

    public static function hash(): string
    {
        return self::document()['hash'];
    }

    private static function body(): string
    {
        return <<<MD
**Afya Yako Siri Yako — Tele-Mental Health Informed Consent**

Please read this before starting tele-counselling or tele-psychology. It explains
how online sessions work, their benefits and their limits, so you can make an
informed choice.

**1. What tele-mental health is.** Your sessions happen over a distance using
phone, video or chat instead of meeting in the same room. The same professional
and ethical standards that apply to in-person care apply here.

**2. Benefits.** Access from where you are, no travel, more privacy, and
continuity of care during emergencies such as disease outbreaks.

**3. Limits and risks.** Technology can fail (poor connection, dropped calls).
Online contact may make it harder to read body language. Tele-services are not
suitable for everyone or every situation; your therapist may recommend in-person
care or refer you elsewhere if that is safer for you.

**4. Emergencies.** Tele-services are **not** an emergency service. If you are in
immediate danger, call Free Counselling 1199, Befrienders Kenya 0800 723 253, or
Emergency/Police 999 / 112. Your therapist will agree an emergency plan with you
and may need to contact a person near you (a relative, facilitator or local
services) if your safety is at risk.

**5. Privacy and confidentiality.** What you share is kept confidential. Choose a
private, quiet space for your sessions. Confidentiality has legal limits — your
therapist may have to act or report if there is risk of serious harm to you or
others, or where the law requires it (for example, safeguarding of children).

**6. Records.** Notes and records of your care are kept securely, in line with
Kenyan law, and you may request a copy.

**7. Recording.** Sessions are **not** recorded unless you give specific
permission first. You can decline or withdraw recording consent at any time.

**8. Your identity and age.** You confirm that the information you give
(including your date of birth) is true. If you are under 18, a parent or guardian
must give consent and you must also give your own assent before sessions begin.

**9. Billing.** Fees and any booking charges are shown before you pay. Cancelled
or missed sessions may be subject to the published policy.

**10. Your choice.** Taking part is voluntary. You may ask questions, pause, or
stop tele-services at any time and ask for in-person care or a referral.

By accepting, you confirm you have read and understood this information and
consent to receive tele-mental health services under these terms.
MD;
    }
}
