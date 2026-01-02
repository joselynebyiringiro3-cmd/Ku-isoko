import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div className="card">
                <h1 className="page-title">Contact Us</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3>Get in Touch</h3>
                        <p style={{ margin: '1rem 0' }}>Have a question or feedback? We'd love to hear from you!</p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <FaEnvelope style={{ color: '#667eea' }} />
                            <span>support@ku-isoko.com</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <FaPhone style={{ color: '#667eea' }} />
                            <span>+250 123 456 789</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <FaMapMarkerAlt style={{ color: '#667eea' }} />
                            <span>Kigali, Rwanda</span>
                        </div>
                    </div>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => e.preventDefault()}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Name</label>
                            <input type="text" style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="Your Name" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Email</label>
                            <input type="email" style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="Your Email" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Message</label>
                            <textarea rows="4" style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="How can we help?"></textarea>
                        </div>
                        <button className="btn btn-primary" type="submit">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
