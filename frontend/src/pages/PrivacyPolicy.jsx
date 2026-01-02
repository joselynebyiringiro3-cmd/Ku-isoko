import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div className="card">
                <h1 className="page-title">Privacy Policy</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <div style={{ marginTop: '2rem' }}>
                    <h3>1. Introduction</h3>
                    <p>Welcome to Ku-isoko. We respect your privacy and are committed to protecting your personal data.</p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>2. Data We Collect</h3>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>Identity Data (name, username)</li>
                        <li>Contact Data (email, phone number, address)</li>
                        <li>Transaction Data (payments, orders)</li>
                        <li>Technical Data (IP address, browser type)</li>
                    </ul>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>3. How We Use Your Data</h3>
                    <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
