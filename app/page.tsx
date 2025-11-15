import LandingHeader from "@/components/ui/LandingHeader";
import HeroSection from "@/components/ui/landing/HeroSection";
import StatsSection, { StatItem } from "@/components/ui/landing/StatsSection";
import FeaturesSection, { FeatureItem } from "@/components/ui/landing/FeaturesSection";
import IndustriesSection, { IndustryItem } from "@/components/ui/landing/IndustriesSection";
import TestimonialsSection, { TestimonialItem } from "@/components/ui/landing/TestimonialsSection";
import FAQSection, { FAQItem } from "@/components/ui/landing/FAQSection";
import PricingSection, { PricingTier } from "@/components/ui/landing/PricingSection";
import CallToActionSection from "@/components/ui/landing/CallToActionSection";
import LandingFooter from "@/components/ui/landing/LandingFooter";

const stats: StatItem[] = [
  { label: 'Uptime Guarantee', value: '99.9%' },
  { label: 'Active Agents', value: '50K+' },
  { label: 'Calls Handled Monthly', value: '10M+' },
  { label: 'Customer Rating', value: '4.9/5' },
];

const features: FeatureItem[] = [
  {
    title: 'Smart Call Routing',
    description: 'Intelligent call distribution based on agent skills, availability, and customer priority. Reduce wait times and improve first-call resolution.',
    icon: 'smart-call-routing',
    iconSrc: '/logo/Call1.svg'
  },
  {
    title: 'Real-Time Analytics',
    description: 'Comprehensive dashboards with live metrics, performance tracking, and actionable insights to optimize your call center operations.',
    icon: 'real-time-analytics',
    iconSrc: '/logo/Call2.svg'
  },
  {
    title: 'Contact Management',
    description: 'Unified customer profiles with complete interaction history, notes, and automated data enrichment for personalized service.',
    icon: 'contact-management',
    iconSrc: '/logo/Call3.svg'
  },
  {
    title: 'Custom Workflows',
    description: 'Build automated workflows tailored to your processes. Trigger actions, send notifications, and streamline repetitive tasks.',
    icon: 'custom-workflows',
    iconSrc: '/logo/Call4.svg'
  },
  {
    title: 'Omnichannel Support',
    description: 'Manage calls, emails, SMS, chat, and social media from a single platform. Provide seamless customer experiences across all channels.',
    icon: 'omnichannel-support',
    iconSrc: '/logo/Call5.svg'
  },
  {
    title: 'Advanced Security',
    description: 'Enterprise-grade encryption, role-based access control, and compliance with GDPR, HIPAA, and PCI-DSS standards.',
    icon: 'advanced-security',
    iconSrc: '/logo/Call6.svg'
  },
  {
    title: 'Cloud-Based Platform',
    description: 'Access your CRM from anywhere with our secure cloud infrastructure. Scale instantly without hardware investments.',
    icon: 'cloud-based-platform',
    iconSrc: '/logo/Call7.svg'
  },
  {
    title: 'Performance Tracking',
    description: 'Track KPIs like average handle time, CSAT scores, and conversion rates. Set goals and monitor team performance in real-time.',
    icon: 'performance-tracking',
    iconSrc: '/logo/Call8.svg'
  },
  {
    title: 'Quality Monitoring',
    description: 'Record calls, score interactions, and provide coaching feedback. Ensure consistent service quality across your team.',
    icon: 'performance-tracking',
    iconSrc: '/logo/Call9.svg'
  },
];

const industries: IndustryItem[] = [
  {
    title: 'Customer Support',
    description: 'Deliver exceptional customer experiences with intelligent case routing and knowledge suggestions.',
    iconSrc: '/logo/earphone.svg'
  },
  {
    title: 'Technical Support',
    description: 'Resolve complex issues faster with integrated diagnostics and collaborative workspaces.',
    iconSrc: '/logo/shield.svg'
  },
  {
    title: 'Outbound Calling',
    description: 'Launch targeted campaigns with predictive dialing, compliant scripts, and live conversion insights.',
    iconSrc: '/logo/phone.svg'
  },
];

const testimonials: TestimonialItem[] = [
  {
    name: 'Tom John',
    title: 'VP of Customer Success, Tech Solutions',
    quote: '“Peoplely CRM cut our average handle time by 18% in just three weeks. Switching between tools is a thing of the past.”',
    iconSrc: '/logo/greenStar.svg'
  },
  {
    name: 'Michelle Michael',
    title: 'Operations Director, Health Connect',
    quote: '“Supercharged visibility. I can see team performance, sentiment, and QA feedback in one place. Our NPS jumped 12 points.”',
    iconSrc: '/logo/greenStar.svg'
  },
  {
    name: 'Emma Francis',
    title: 'Call Center Manager, Retail Hub',
    quote: '“Getting started was seamless. The onboarding team migrated thousands of contacts and built our workflows in days.”',
    iconSrc: '/logo/greenStar.svg'
  },
];

const faqs: FAQItem[] = [
  {
    question: 'How fast can we upload large customer bases or lead lists?',
    answer:
      'You can import unlimited records via CSV, SFTP, or API. Our migration specialists will guide you through deduplicating, field mapping, and data validation so everything is ready day one.',
  },
  {
    question: 'What security measures are in place for our customer data?',
    answer:
      'Peoplely CRM is secured with AES-256 encryption, SSO/SAML, granular permissions, and SOC2 compliant infrastructure hosted in ISO certified data centers.',
  },
  {
    question: 'How customizable is the CRM for our specific call flows?',
    answer:
      'Design any workflow using drag-and-drop automation. Trigger actions based on queues, SLAs, dispositions, or integrations—no engineering tickets required.',
  },
  {
    question: 'Is this system only for outbound or does it handle inbound calls too?',
    answer:
      'Handle inbound, outbound, and blended call strategies. Build IVRs, predictive campaigns, and follow-ups from the same console.',
  },
  {
    question: 'Will we need a dedicated IT team to manage the system?',
    answer:
      'No dedicated team needed. Administrators can configure everything from the browser, and our success engineers partner with you for complex projects.',
  },
  {
    question: 'Can managers monitor agent status and performance in real-time?',
    answer:
      'Yes. Supervisors get live dashboards with agent presence, queue depth, KPI alerts, and one-click coaching tools.',
  },
];

const pricing: PricingTier[] = [
  {
    title: 'Starter',
    price: '₦49',
    description: 'Perfect for small teams getting started.',
    highlight: false,
    features: [
      'Up to 25 agent seats',
      'Contact management',
      'Omnichannel inbox',
      'Basic analytics',
      'Role permissions',
    ],
  },
  {
    title: 'Professional',
    price: '₦99',
    description: 'For growing call centers.',
    highlight: true,
    features: [
      'Unlimited agent seats',
      'Advanced routing & IVR',
      'Predictive dialing',
      'Real-time dashboards',
      'Workforce management',
    ],
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    description: 'For large-scale operations.',
    highlight: false,
    features: [
      'Dedicated success manager',
      'Private cloud or on-prem',
      'Custom integrations',
      'AI quality monitoring',
      'Priority support & SLAs',
    ],
  },
];

export default function Home() {
  const heroAgents = ['Sarah M.', 'Kemi O.', 'Ivan D.', 'Lisa R.'];

  return (
    <div className="bg-page">
      <LandingHeader />

      <div className="flex flex-col gap-24">
        <HeroSection agents={heroAgents} />

        <StatsSection items={stats} />

        <FeaturesSection items={features} />

        <IndustriesSection items={industries} />

        <TestimonialsSection items={testimonials} />

        <FAQSection items={faqs} />

        <PricingSection tiers={pricing} />

        <CallToActionSection />
      </div>

      <LandingFooter />
    </div>
  );
}
