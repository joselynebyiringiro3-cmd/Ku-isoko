import React from 'react';

const TermsOfService = () => {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div className="card">
                <h1 className="page-title">Terms of Service</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <div style={{ marginTop: '2rem' }}>
                    <h3>1. Agreement to Terms</h3>
                    <p>By viewing or using our website, you agree to these Terms of Service.</p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>2. Accounts</h3>
                    <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>3. Intellectual Property</h3>
                    <p>The Service and its original content, features and functionality are and will remain the exclusive property of Ku-isoko and its licensors.</p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>4. Termination</h3>
                    <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
