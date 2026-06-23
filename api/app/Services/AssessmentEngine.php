<?php

namespace App\Services;

class AssessmentEngine
{
    public function run(string $type, array $responses): array
    {
        return match ($type) {
            'phq9'  => $this->scorePhq9($responses),
            'gad7'  => $this->scoreGad7($responses),
            'audit' => $this->scoreAudit($responses),
            'pgsi'  => $this->scorePgsi($responses),
            'ftnd'  => $this->scoreFtnd($responses),
            'isi'   => $this->scoreIsi($responses),
            default => throw new \InvalidArgumentException("Unknown assessment type: {$type}"),
        };
    }

    public function scorePhq9(array $responses): array
    {
        $keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
        $score = 0;
        foreach ($keys as $key) {
            $score += (int) ($responses[$key] ?? 0);
        }

        $isCrisis = (int) ($responses['q9'] ?? 0) >= 1;

        if ($score <= 4) {
            $severity = 'Minimal';
            $interpretation = 'Your responses suggest minimal or no symptoms of depression. You appear to be coping well emotionally.';
            $recommendations = 'Continue maintaining your mental wellness through regular self-care, exercise, and social connections. Consider periodic check-ins to monitor your mood.';
        } elseif ($score <= 9) {
            $severity = 'Mild';
            $interpretation = 'Your responses indicate mild depressive symptoms. You may be experiencing some low mood, reduced energy, or negative thoughts.';
            $recommendations = 'Consider practicing mindfulness, improving sleep hygiene, and engaging in physical activity. Talking to a trusted friend or counselor may also help.';
        } elseif ($score <= 14) {
            $severity = 'Moderate';
            $interpretation = 'You are experiencing moderate symptoms of depression that may be affecting your daily functioning, relationships, and quality of life.';
            $recommendations = 'We strongly recommend speaking with a mental health professional. Therapy, particularly Cognitive Behavioural Therapy (CBT), has proven effective for moderate depression.';
        } elseif ($score <= 19) {
            $severity = 'Moderately Severe';
            $interpretation = 'Your responses indicate moderately severe depression. These symptoms likely have a significant impact on your ability to function at work, home, and in relationships.';
            $recommendations = 'Please seek professional help promptly. A combination of psychotherapy and medication evaluation by a psychiatrist may be necessary.';
        } else {
            $severity = 'Severe';
            $interpretation = 'Your responses suggest severe depression. This level of depression requires immediate professional attention and support.';
            $recommendations = 'Please reach out to a mental health professional or crisis line immediately. Do not face this alone — effective treatment is available.';
        }

        if ($isCrisis) {
            $recommendations = 'IMPORTANT: You have indicated thoughts of self-harm or suicide. Please reach out immediately to a crisis line or mental health professional. You are not alone. ' . $recommendations;
        }

        return [
            'score' => $score,
            'severity' => $severity,
            'interpretation' => $interpretation,
            'recommendations' => $recommendations,
            'is_crisis_flag' => $isCrisis,
        ];
    }

    public function scoreGad7(array $responses): array
    {
        $keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];
        $score = 0;
        foreach ($keys as $key) {
            $score += (int) ($responses[$key] ?? 0);
        }

        if ($score <= 4) {
            $severity = 'Minimal';
            $interpretation = 'Your responses suggest minimal anxiety symptoms. You appear to be managing stress and worry effectively.';
            $recommendations = 'Continue with healthy coping strategies. Mindfulness and relaxation techniques can help maintain your current wellbeing.';
        } elseif ($score <= 9) {
            $severity = 'Mild';
            $interpretation = 'You are experiencing mild anxiety symptoms. Worry and nervousness may be affecting some areas of your life.';
            $recommendations = 'Practice deep breathing, progressive muscle relaxation, and reduce caffeine. Consider journaling your worries and challenging negative thoughts.';
        } elseif ($score <= 14) {
            $severity = 'Moderate';
            $interpretation = 'You have moderate anxiety symptoms that are likely impacting your daily activities and quality of life.';
            $recommendations = 'Consider seeking support from a mental health professional. CBT is highly effective for anxiety disorders. Lifestyle changes like regular exercise also help significantly.';
        } else {
            $severity = 'Severe';
            $interpretation = 'Your responses indicate severe anxiety symptoms. This level of anxiety can be very distressing and may significantly impair daily functioning.';
            $recommendations = 'Please seek professional help as soon as possible. Severe anxiety is treatable with therapy and/or medication. Do not try to manage this alone.';
        }

        return [
            'score' => $score,
            'severity' => $severity,
            'interpretation' => $interpretation,
            'recommendations' => $recommendations,
            'is_crisis_flag' => false,
        ];
    }

    public function scoreAudit(array $responses): array
    {
        $score = 0;

        // Q1-Q8: scored 0-4 directly
        for ($i = 1; $i <= 8; $i++) {
            $score += (int) ($responses["q{$i}"] ?? 0);
        }

        // Q9-Q10: value 1 → 2pts, value 2 → 4pts, else as-is
        for ($i = 9; $i <= 10; $i++) {
            $val = (int) ($responses["q{$i}"] ?? 0);
            if ($val === 1) {
                $score += 2;
            } elseif ($val === 2) {
                $score += 4;
            } else {
                $score += $val;
            }
        }

        if ($score <= 7) {
            $severity = 'Low Risk';
            $interpretation = 'Your alcohol use appears to be at a low-risk level. You do not show signs of hazardous or harmful drinking patterns.';
            $recommendations = 'Maintain awareness of your drinking habits. The recommended limit is no more than 14 units per week for adults, with alcohol-free days.';
        } elseif ($score <= 15) {
            $severity = 'Hazardous Use';
            $interpretation = 'Your drinking patterns suggest hazardous alcohol use. This increases your risk of health problems and alcohol-related harm.';
            $recommendations = 'Consider reducing your alcohol intake. Track your drinks, set limits, and have alcohol-free days. Speaking with your doctor about strategies can help.';
        } elseif ($score <= 19) {
            $severity = 'Harmful Use';
            $interpretation = 'Your responses indicate harmful alcohol use that is likely already causing physical, psychological, or social harm.';
            $recommendations = 'We recommend seeking professional support to reduce your alcohol use. Brief counseling and medical support can be very effective.';
        } else {
            $severity = 'Possible Dependence';
            $interpretation = 'Your responses suggest possible alcohol dependence. You may have difficulty controlling your drinking and experience withdrawal symptoms.';
            $recommendations = 'Please seek medical and psychological help urgently. Do not attempt to stop drinking abruptly without medical supervision as this can be dangerous.';
        }

        return [
            'score' => $score,
            'severity' => $severity,
            'interpretation' => $interpretation,
            'recommendations' => $recommendations,
            'is_crisis_flag' => false,
        ];
    }

    public function scorePgsi(array $responses): array
    {
        $keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
        $score = 0;
        foreach ($keys as $key) {
            $score += (int) ($responses[$key] ?? 0);
        }

        if ($score === 0) {
            $severity = 'Non-Problem Gambling';
            $interpretation = 'Your responses suggest no significant gambling-related problems. You appear to gamble recreationally without negative consequences.';
            $recommendations = 'Continue to gamble responsibly if you choose to. Set limits on time and money spent, and never gamble with money you cannot afford to lose.';
        } elseif ($score <= 2) {
            $severity = 'Low Risk';
            $interpretation = 'Your gambling behaviour shows some low-risk patterns. There may be minor negative consequences but no significant harm at this time.';
            $recommendations = 'Monitor your gambling habits. Set clear financial and time limits. Be aware of emotional triggers that may lead to increased gambling.';
        } elseif ($score <= 7) {
            $severity = 'Moderate Risk';
            $interpretation = 'Your responses indicate moderate-risk gambling. You may be experiencing some negative consequences from your gambling behaviour.';
            $recommendations = 'Consider speaking with a gambling counselor. Strategies like self-exclusion, limiting access to funds, and finding alternative activities can help.';
        } else {
            $severity = 'Severe (Problem Gambling)';
            $interpretation = 'Your responses indicate severe problem gambling. Gambling is likely causing significant harm to your finances, relationships, and mental health.';
            $recommendations = 'Please seek professional help immediately. Gambling disorder is treatable. Contact a gambling helpline or counselor for confidential support.';
        }

        return [
            'score' => $score,
            'severity' => $severity,
            'interpretation' => $interpretation,
            'recommendations' => $recommendations,
            'is_crisis_flag' => false,
        ];
    }

    public function scoreFtnd(array $responses): array
    {
        $score = 0;

        // Q1: 0=0pts, 1=1pt, 2=2pts, 3=3pts (time to first cigarette after waking)
        $q1Map = [0 => 3, 1 => 2, 2 => 1, 3 => 0];
        $score += $q1Map[(int) ($responses['q1'] ?? 0)] ?? 0;

        // Q2: binary (do you find it hard to refrain in forbidden places?) 0=No, 1=Yes
        $score += (int) ($responses['q2'] ?? 0);

        // Q3: which cigarette would you hate to give up? 0=first in morning, 1=other → 0=1pt, 1=0pt
        $score += ((int) ($responses['q3'] ?? 1) === 0) ? 1 : 0;

        // Q4: how many cigarettes per day? 0=≤10, 1=11-20, 2=21-30, 3=≥31
        $q4Map = [0 => 0, 1 => 1, 2 => 2, 3 => 3];
        $score += $q4Map[(int) ($responses['q4'] ?? 0)] ?? 0;

        // Q5: do you smoke more in the first hours? 0=No, 1=Yes
        $score += (int) ($responses['q5'] ?? 0);

        // Q6: do you smoke when ill? 0=No, 1=Yes
        $score += (int) ($responses['q6'] ?? 0);

        if ($score <= 2) {
            $severity = 'Very Low Dependence';
            $interpretation = 'You have very low nicotine dependence. Quitting may be easier with the right support and motivation.';
            $recommendations = 'Set a quit date and use behavioural strategies. Apps, support groups, and brief counseling can improve your success rate.';
        } elseif ($score <= 4) {
            $severity = 'Low Dependence';
            $interpretation = 'You have low nicotine dependence. You may experience mild withdrawal symptoms when trying to quit.';
            $recommendations = 'Consider using nicotine replacement therapy (NRT) like patches or gum alongside behavioural support.';
        } elseif ($score === 5) {
            $severity = 'Medium Dependence';
            $interpretation = 'You have medium nicotine dependence. Withdrawal symptoms may be moderate and cravings significant.';
            $recommendations = 'NRT combined with counseling or a smoking cessation program is recommended. Consider speaking with a doctor about medication options.';
        } elseif ($score <= 7) {
            $severity = 'High Dependence';
            $interpretation = 'You have high nicotine dependence. Quitting without support is challenging, and you are likely to experience significant withdrawal symptoms.';
            $recommendations = 'Seek professional cessation support. Combination NRT or prescription medications (varenicline, bupropion) alongside counseling are most effective at this level.';
        } else {
            $severity = 'Very High Dependence';
            $interpretation = 'You have very high nicotine dependence. Nicotine has a strong grip on your daily routine and physiology.';
            $recommendations = 'Immediate professional support is strongly advised. Medical treatment with prescription medications and intensive behavioral therapy offers the best chance of success.';
        }

        return [
            'score' => $score,
            'severity' => $severity,
            'interpretation' => $interpretation,
            'recommendations' => $recommendations,
            'is_crisis_flag' => false,
        ];
    }

    public function scoreIsi(array $responses): array
    {
        $keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];
        $score = 0;
        foreach ($keys as $key) {
            $score += (int) ($responses[$key] ?? 0);
        }

        if ($score <= 7) {
            $severity = 'No Clinically Significant Insomnia';
            $interpretation = 'Your sleep appears to be healthy. You are falling asleep, staying asleep, and waking refreshed most nights.';
            $recommendations = 'Continue maintaining good sleep habits: consistent sleep schedule, dark/cool bedroom, limit screen time before bed, avoid caffeine in the evening.';
        } elseif ($score <= 14) {
            $severity = 'Subthreshold Insomnia';
            $interpretation = 'You are experiencing some sleep difficulties but they are not yet significantly impacting your daily functioning. Sleep issues are mild to moderate.';
            $recommendations = 'Try improving sleep hygiene: establish a bedtime routine, limit naps, exercise earlier in the day, use relaxation techniques like deep breathing before bed.';
        } elseif ($score <= 21) {
            $severity = 'Moderate Clinical Insomnia';
            $interpretation = 'You are experiencing moderate insomnia that is likely affecting your daytime functioning, mood, and concentration. Sleep is a significant concern.';
            $recommendations = 'Consider speaking with a sleep specialist or mental health professional. Cognitive Behavioural Therapy for Insomnia (CBT-I) is highly effective. Avoid sleep medications as a first resort.';
        } else {
            $severity = 'Severe Clinical Insomnia';
            $interpretation = 'Your insomnia is severe and significantly impacting your health, work, relationships, and quality of life. This requires professional intervention.';
            $recommendations = 'Please seek professional help from a sleep specialist or psychiatrist. CBT-I is the gold standard treatment. A sleep study may be recommended to rule out sleep disorders like sleep apnea.';
        }

        return [
            'score' => $score,
            'severity' => $severity,
            'interpretation' => $interpretation,
            'recommendations' => $recommendations,
            'is_crisis_flag' => false,
        ];
    }
}
