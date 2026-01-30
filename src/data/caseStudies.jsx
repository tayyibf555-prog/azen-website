import React from "react";
import { Briefcase, Users, Building2, Truck } from "lucide-react";

export const cases = [
    {
        slug: "prep-point",
        industry: "Logistics",
        title: "Prep Point",
        desc: "Streamlining student enrollment and support with AI-driven communication.",
        heroImage: "/images/prep_point_banner.jpg",
        details: "We deployed a specialized AI Automation stack to inject speed and precision into their warehouse operations, focusing on the moment a shipment arrives.",
        content: {
            overview: "As a key service provider for Amazon FBA sellers and e-commerce brands, Prep Point's scalability was entirely dependent on the speed and accuracy of their prep work. The process of receiving bulk shipments, manually checking manifests against physical counts, inspecting for defects, and initiating prep work was a major bottleneck. Discrepancies often led to disputes with suppliers or delays for the end-client, slowing the entire supply chain.",
            challenge: "As a key service provider for Amazon FBA sellers and e-commerce brands, Prep Point's scalability was entirely dependent on the speed and accuracy of their prep work. The process of receiving bulk shipments, manually checking manifests against physical counts, inspecting for defects, and initiating prep work was a major bottleneck.",
            solution: "We deployed a specialized AI Automation stack to inject speed and precision into their warehouse operations, focusing on the moment a shipment arrives.",
            implementation: [
                {
                    title: "AI Vision Inspection",
                    desc: "High-resolution cameras were installed at the receiving bay. Our custom computer vision model was trained to instantly identify SKUs, count units, and detect common physical defects (e.g., damaged packaging, missing labels) as they passed through."
                },
                {
                    title: "Automated Reconciliation",
                    desc: "An intelligent system automatically compared the electronic Advance Shipping Notice (ASN) data provided by the client with the real-time, verified count from the AI Vision system. Any variance was immediately flagged for a human to review, eliminating manual spreadsheet reconciliation."
                },
                {
                    title: "Real-Time Client Notifications",
                    desc: "Upon successful completion of the AI check-in, automated notifications were triggered, updating the client's portal or sending an email instantly."
                }
            ],
            results: "The automation shifted Prep Point from reactive, manual processing to proactive, high-speed logistics, positioning them as an industry leader in fulfillment efficiency. Inbound Efficiency: Time spent on shipment verification and reconciliation dropped by 45%. Error Elimination: Inventory count discrepancies and resulting errors decreased by 85%. Capacity Increase: The newfound efficiency allowed Prep Point to absorb a 30% increase in daily throughput without needing to increase labor costs.",
            quote: {
                text: "We can now guarantee faster, more accurate service to our clients. The AI system handles the grunt work, and our team focuses on high-quality prep and value-added services.",
                author: "Operations Director, Prep Point"
            }
        },
        stats: [
            { label: "Verification Time", value: "-45%" },
            { label: "Error Reduction", value: "85%" },
            { label: "Throughput", value: "+30%" }
        ],
        icon: <Truck className="w-6 h-6" />
    },
    {
        slug: "superior-accounting",
        industry: "Financial Services",
        title: "Superior Accounting",
        desc: "Leveraging AI to Achieve 78% Call Resolution and Increase Accountant Productivity.",
        details: "Superior Accounting was growing rapidly, but their success was creating an administrative bottleneck. High call volumes from clients asking common questions constantly interrupted their highly-paid human accountants.",
        heroImage: "/images/superior_banner_hq.jpg",
        content: {
            overview: "Superior Accounting was growing rapidly, but their success was creating an administrative bottleneck. High call volumes from clients asking common questions (e.g., \"What are your hours?\", \"Do you handle payroll?\", \"Can I book a consultation?\") constantly interrupted their highly-paid human accountants. Furthermore, any client attempting to call outside of standard business hours would hit an answering machine, risking lost business and poor service perception. The firm needed a solution that could provide seamless, professional 24/7 service without adding payroll costs.",
            challenge: "Superior Accounting was growing rapidly, but their success was creating an administrative bottleneck. High call volumes from clients asking common questions constantly interrupted their highly-paid human accountants.",
            solution: "Our agency designed, trained, and implemented a sophisticated AI Voice Receptionist. This solution was specifically customized to handle the nuances of an accounting firm's inquiries.",
            implementation: [
                {
                    title: "Deep Training",
                    desc: "The AI was fed comprehensive data on all services, pricing tiers, FAQs, and common compliance deadlines."
                },
                {
                    title: "Conversational Mapping",
                    desc: "We mapped out all potential conversation flows, ensuring the AI could handle complex scheduling requests, general information, and know when to safely escalate urgent calls to a human agent."
                },
                {
                    title: "Calendar Integration",
                    desc: "We connected the AI directly to the team's scheduling software, allowing it to book, confirm, and reschedule client appointments instantly via voice."
                }
            ],
            results: "Within the first month, the AI demonstrated its value by taking over the vast majority of routine calls, allowing human staff to focus exclusively on billable client work.",
            quote: {
                text: "The AI is not just an answering machine; it's our most productive receptionist. Our accountants finally have the uninterrupted time they need to deliver high-quality work.",
                author: "Managing Partner, Superior Accounting"
            }
        },
        stats: [
            { label: "Call Resolution", value: "78%" },
            { label: "Consults", value: "+30%" },
            { label: "Admin time", value: "-15h/wk" }
        ],
        icon: <Briefcase className="w-6 h-6" />
    },
    {
        slug: "ttt-departmentals",
        industry: "Retail",
        title: "TTT Departmentals",
        desc: "Enhancing customer service and inventory inquiries with automated voice agents.",
        heroImage: "/images/ttt_banner.jpg",
        details: "We built a centralized, intelligent platform that automated the entire sourcing lifecycle, allowing the TTT team to become strategic decision-makers instead of data miners.",
        content: {
            overview: "TTT Departmentals' competitive advantage lies in its ability to rapidly find trending products and secure the best pricing from global suppliers. However, this process was heavily reliant on manual human effort—sourcing agents trawling multiple platforms, comparing PDFs, and updating complex spreadsheets. The delay between identifying a trend and locking down a supplier meant missing the peak profit window or settling for less-than-ideal terms.",
            challenge: "TTT Departmentals' competitive advantage lies in its ability to rapidly find trending products and secure the best pricing from global suppliers. However, this process was heavily reliant on manual human effort—sourcing agents trawling multiple platforms, comparing PDFs, and updating complex spreadsheets.",
            solution: "We built a centralized, intelligent platform that automated the entire sourcing lifecycle, allowing the TTT team to become strategic decision-makers instead of data miners.",
            implementation: [
                {
                    title: "AI Trend Scout",
                    desc: "The engine utilizes AI to continuously monitor global e-commerce, social media, and search data. It uses machine learning to score and predict the next high-growth product categories, delivering a prioritized \"Top Opportunity\" list daily."
                },
                {
                    title: "Automated Quote Extraction (NLP)",
                    desc: "Suppliers send quotes in diverse formats (PDFs, images, emails). Our Natural Language Processing (NLP) model automatically ingests these documents, extracts key data (Unit Price, MOQ, Lead Time, Payment Terms), and standardizes it into a single, comparative dashboard."
                },
                {
                    title: "Dynamic Pricing Tracker",
                    desc: "The system continuously monitors the price history and inventory levels of key suppliers, flagging optimal times for bulk purchasing or re-negotiation."
                }
            ],
            results: "By replacing manual research with AI intelligence, TTT Departmentals achieved a significant edge in speed and profitability. Sourcing Speed: The time required to validate a new product opportunity and create a preliminary supplier comparison was reduced by over 90% (from 2-3 days to under 4 hours). Profitability: Instantaneous quote comparison and price monitoring led to an average 4% increase in the gross profit margin of newly sourced products.",
            quote: {
                text: "The Intelligence Engine is like having an army of market researchers working 24/7. We now enter negotiations armed with perfect data, which has fundamentally changed our bottom line.",
                author: "CEO, TTT Departmentals"
            }
        },
        stats: [
            { label: "Sourcing Speed", value: "-90%" },
            { label: "Profit Margin", value: "+4%" },
            { label: "Productivity", value: "3x" }
        ],
        icon: <Building2 className="w-6 h-6" />,
        clientLogo: null
    }
];
