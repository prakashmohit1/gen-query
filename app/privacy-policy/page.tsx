"use client";

import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary-900 mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-600 mb-4">
            At Gen Query, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our database management service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            2. Information We Collect
          </h2>
          <h3 className="text-xl font-medium text-primary-700 mb-3">
            2.1 Personal Information
          </h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Name and email address</li>
            <li>Account credentials</li>
            <li>Company information</li>
            <li>Payment information</li>
          </ul>

          <h3 className="text-xl font-medium text-primary-700 mb-3">
            2.2 Usage Data
          </h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Log data and analytics</li>
            <li>Device and browser information</li>
            <li>IP address and location data</li>
            <li>Database connection metadata</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            3. How We Use Your Information
          </h2>
          <p className="text-gray-600 mb-4">
            We use the collected information for:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Providing and maintaining our service</li>
            <li>Processing your transactions</li>
            <li>Sending service updates and notifications</li>
            <li>Improving our service and user experience</li>
            <li>Responding to your inquiries and support requests</li>
            <li>Detecting and preventing fraudulent activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            4. Data Security
          </h2>
          <p className="text-gray-600 mb-4">
            We implement robust security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>End-to-end encryption for data transmission</li>
            <li>Secure storage with industry-standard encryption</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Employee training on data protection</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            5. Data Sharing and Disclosure
          </h2>
          <p className="text-gray-600 mb-4">
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Service providers and business partners</li>
            <li>Legal authorities when required by law</li>
            <li>Third parties with your explicit consent</li>
          </ul>
          <p className="text-gray-600 mb-4">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            6. Your Privacy Rights
          </h2>
          <p className="text-gray-600 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            7. Cookies and Tracking
          </h2>
          <p className="text-gray-600 mb-4">
            We use cookies and similar tracking technologies to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Remember your preferences</li>
            <li>Analyze usage patterns</li>
            <li>Maintain secure sessions</li>
            <li>Improve service performance</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            8. Children's Privacy
          </h2>
          <p className="text-gray-600 mb-4">
            Our service is not intended for children under 13 years of age. We
            do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            9. International Data Transfers
          </h2>
          <p className="text-gray-600 mb-4">
            Your information may be transferred and processed in countries other
            than your own. We ensure appropriate safeguards are in place for
            such transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            10. Changes to Privacy Policy
          </h2>
          <p className="text-gray-600 mb-4">
            We may update this privacy policy periodically. We will notify you
            of any material changes through our service or via email.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">
            11. Contact Us
          </h2>
          <p className="text-gray-600 mb-4">
            For any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Email: privacy@genquery.com</li>
            <li>Address: [Your Company Address]</li>
            <li>Phone: [Your Contact Number]</li>
          </ul>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
