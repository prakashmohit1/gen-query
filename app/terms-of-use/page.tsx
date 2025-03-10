"use client";

import React from "react";

const TermsOfUsePage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Terms of Use</h1>

      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 mb-4">
            By accessing and using Gen Query, you accept and agree to be bound
            by the terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            2. Database Services
          </h2>
          <p className="text-gray-600 mb-4">
            Gen Query provides database connection and management services.
            Users are responsible for:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Maintaining the security of their database credentials</li>
            <li>Ensuring proper access controls and permissions</li>
            <li>Complying with data protection regulations</li>
            <li>
              Using the service in accordance with their database provider's
              terms
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            3. User Responsibilities
          </h2>
          <p className="text-gray-600 mb-4">Users of Gen Query agree to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Provide accurate and complete information</li>
            <li>Maintain the confidentiality of their account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Use the service in compliance with all applicable laws</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            4. Privacy and Data Protection
          </h2>
          <p className="text-gray-600 mb-4">
            We are committed to protecting your privacy and handling your data
            in accordance with applicable data protection laws. Our service:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Encrypts all sensitive data in transit and at rest</li>
            <li>Does not store database passwords or sensitive credentials</li>
            <li>Implements industry-standard security measures</li>
            <li>Provides transparency about data collection and use</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            5. Service Availability and Support
          </h2>
          <p className="text-gray-600 mb-4">
            While we strive to provide uninterrupted service, we:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Do not guarantee 100% uptime</li>
            <li>May perform maintenance with advance notice</li>
            <li>Provide support through designated channels</li>
            <li>Reserve the right to modify or discontinue features</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            6. Intellectual Property
          </h2>
          <p className="text-gray-600 mb-4">
            All content, features, and functionality of Gen Query are owned by
            us and are protected by international copyright, trademark, and
            other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            7. Limitation of Liability
          </h2>
          <p className="text-gray-600 mb-4">
            Gen Query and its affiliates shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages resulting
            from your use of or inability to use the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            8. Changes to Terms
          </h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to modify these terms at any time. We will
            notify users of any material changes via email or through the
            service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            9. Contact Information
          </h2>
          <p className="text-gray-600 mb-4">
            For any questions about these Terms of Use, please contact us at:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Email: support@genquery.com</li>
            <li>Website: www.genquery.com</li>
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

export default TermsOfUsePage;
