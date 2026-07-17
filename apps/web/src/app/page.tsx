import { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import Features from '@/components/landing/Features';
import DashboardPreview from '@/components/landing/DashboardPreview';
import AISection from '@/components/landing/AISection';
import WhatsAppSection from '@/components/landing/WhatsAppSection';
import SalesPipeline from '@/components/landing/SalesPipeline';
import MobileApp from '@/components/landing/MobileApp';
import Integrations from '@/components/landing/Integrations';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'RealFlow CRM — AI-Powered Real Estate CRM Platform',
  description: 'Manage leads, properties inventory, bookings locks, payments invoices, WhatsApp integrations and AI calling agents from a unified platform.',
  keywords: ['real estate CRM', 'builders software', 'brokers CRM', 'WhatsApp CRM', 'AI calling agent'],
  openGraph: {
    title: 'RealFlow CRM — AI-Powered Real Estate CRM Platform',
    description: 'Manage leads, properties inventory, bookings locks, payments invoices, WhatsApp integrations and AI calling agents.',
    type: 'website',
    url: 'https://realflowcrm.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RealFlow CRM — AI-Powered Real Estate CRM Platform',
    description: 'AI-Powered Real Estate CRM that sells more properties faster.',
  },
};

export default function Home() {
  return (
    <div className="bg-white min-h-screen text-[#0F172A] selection:bg-blue-500 selection:text-white font-sans antialiased scroll-smooth">
      {/* Sticky Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Trusted Partners & Statistics */}
      <Stats />

      {/* Features Grid */}
      <Features />

      {/* Interactive CRM Tabs Preview */}
      <DashboardPreview />

      {/* AI Features & Core */}
      <AISection />

      {/* WhatsApp Linker Section */}
      <WhatsAppSection />

      {/* Sales Pipeline Kanban Board */}
      <SalesPipeline />

      {/* Native Mobile App Segment */}
      <MobileApp />

      {/* Software Integrations Grid */}
      <Integrations />

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing Tables & FAQ Accordion */}
      <Pricing />

      {/* High-Gradient Call-To-Action Card */}
      <CTA />

      {/* Premium Site Footer */}
      <Footer />
    </div>
  );
}
