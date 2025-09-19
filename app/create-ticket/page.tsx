//C:\Next\kam\kam_ticket\kam_ticket-master\app\(admin)\ticket\add\page.tsx

'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface ITicket {
  name: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  category: string;
  subCategory: string;
  otherSubCategory?: string;
  title: string;
  details: string;
  image?: File | null;
}


const CreateTicket: React.FC = () => {
    const [formData, setFormData] = useState<ITicket>({
        name: '',
        email: '',
        phone: '',
        location: '',
        department: '',
        category: '',
        subCategory: '',
        otherSubCategory: '',
        title: '',
        details: '',
        image: null,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedForm = { ...prev, [name]: value };
            console.log(`Updated field: ${name} =>`, value);
            console.log('Current form data:', updatedForm);
            return updatedForm;
        });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => {
            const updatedForm = { ...prev, image: file };
            console.log('Selected Image:', file);
            console.log('Current form data:', updatedForm);
            return updatedForm;
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const formDataObj = new FormData();
        formDataObj.append("name", formData.name);
        formDataObj.append("email", formData.email);
        formDataObj.append("phone", formData.phone);
        formDataObj.append("location", formData.location);
        formDataObj.append("department", formData.department);
        formDataObj.append("category", formData.category);
        formDataObj.append("subCategory", formData.subCategory || "");
        formDataObj.append("otherSubCategory", formData.otherSubCategory || "");
        formDataObj.append("title", formData.title);
        formDataObj.append("details", formData.details);

        if (formData.image) {
            formDataObj.append("image", formData.image);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets`, {
                method: "POST",
                body: formDataObj, // Send formData directly
            });

            const data = await response.json();
            if (response.ok) {
                alert("Ticket submitted successfully! Ticket ID: " + data.ticketId);



                 // Send confirmation email to Me
    try {
        const emailResponse = await fetch("/api/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    name: "Helpdesk System",
                    address: "it-helpdesk@kamholding.net", // use your domain's sender email
                },
                reciepients: [
                    {
                        name: "Oladapo",
                        address: "abioyeoladapo@gmail.com",
                    },
                ],
                subject: `New Ticket Created by ${formData.name}`,
                template: "welcome", // optional: you can create a specific ticket template later
                templateData: {
                    name: formData.name,
                },
            }),
        });

        const emailResult = await emailResponse.json();
        if (!emailResponse.ok) {
            console.error("❌ Failed to send confirmation email:", emailResult.error);
        } else {
            console.log("✅ Confirmation email sent:", emailResult);
        }
    } catch (emailError) {
        console.error("❌ Error sending confirmation email:", emailError);
    }



                // Reset form data
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    location: '',
                    department: '',
                    category: '',
                    subCategory: '',
                    otherSubCategory: '',
                    title: '',
                    details: '',
                    image: null,
                });

                router.push('/ticket/view');
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error submitting ticket:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    const router = useRouter();

    const categories: Record<string, string[]> = {
        'Accommodation/Housing Issues': [
            'GCFO Quarters – Irewolede Estate',
            'New House – Irewolede Estate',
            'GRA Quarters – Trove Street, Flower Garden, GRA',
            'Honourable Qtrs 1 – Legislative Qtrs Estate',
            'Honourable Qtrs 2 – Legislative Qtrs Estate',
            'Yellow House – Mandate III Estate',
            'Ghosh House – Mandate III Estate',
            'Jaspal House – Mandate III Estate',
            'Ofa Garage',
        ],
        'Office Issue': ['Water/Plumbing', 'Dispenser', 'Electrical (AC, lighting etc.)', 'Furniture', 'Cleaning', 'Others'],
        'Vehicle Issue': ['Periodic maintenance', 'Battery', 'Electrical/Mechanical Issue', 'Accidents', 'Tyre', 'Vehicle Registration', 'Others'],
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Create a New Ticket</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <InputField label="Full Name" type="text" name="name" value={formData.name} onChange={handleChange} required />
                <InputField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                <InputField label="Phone Number (CUG Preferred)" type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                <SelectField label="Staff Location" name="location" value={formData.location} onChange={handleChange} options={['KAM HQ', 'KSICL – Jimba', 'KSICL – Sagamu/Hullmac', 'KAM Haulage', 'Dimkit Ganmo', 'Dimkit Kaduna', 'Lagos Office']} required />
                <SelectField label="Staff Department" name="department" value={formData.department} onChange={handleChange} options={['HR', 'Audit', 'Supply Chain/Store', 'Admin/Health/Security/Legal', 'Production', 'Account/Finance', 'Electrical/Maintenance', 'IT']} required />
                <SelectField label="Complaint Category" name="category" value={formData.category} onChange={handleChange} options={Object.keys(categories)} required />

                {formData.category && (
                    <SelectField 
                        label="Subcategory" 
                        name="subCategory" 
                        value={formData.subCategory} 
                        onChange={handleChange} 
                        options={[...(categories[formData.category] || []), 'Others']} 
                        required 
                    />
                )}

                {formData.subCategory === 'Others' && (
                    <InputField label="Specify Other Subcategory" type="text" name="otherSubCategory" value={formData.otherSubCategory} onChange={handleChange} required />
                )}

                <InputField label="Title of Complaint" type="text" name="title" value={formData.title} onChange={handleChange} required />
                <TextAreaInput label="Full Detail of Complaint" name="details" value={formData.details} onChange={handleChange} required />
                <InputField label="Attach Screenshot (if any)" type="file" name="image" accept="image/*" onChange={handleImageChange} />

                <button type="submit" className="mt-4 w-full p-2 bg-blue-600 text-white rounded-lg">Submit Ticket</button>
            </form>
        </div>
    );
};

// InputField component with TypeScript types
const InputField: React.FC<{
    label: string;
    type: string;
    name: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
    required?: boolean;
}> = ({ label, type, name, value, onChange, ...props }) => (
    <div className="mb-4">
        <Label htmlFor={name}>{label}</Label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full p-2 border rounded-lg"
            {...props}
        />
    </div>
);

// SelectField component with TypeScript types
const SelectField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
    required?: boolean;
}> = ({ label, name, value, onChange, options, required }) => (
    <div className="mb-4">
        <Label htmlFor={name}>{label}</Label>
        <select id={name} name={name} value={value} onChange={onChange} required={required} className="w-full p-2 border rounded-lg">
            <option value="">Select {label}</option>
            {options.map((option) => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

// TextAreaInput component with TypeScript types
const TextAreaInput: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    required?: boolean;
}> = ({ label, name, value, onChange, required }) => (
    <div className="mb-4">
        <Label htmlFor={name}>{label}</Label>
        <textarea id={name} name={name} value={value} onChange={onChange} required={required} rows={4} className="w-full p-2 border rounded-lg"></textarea>
    </div>
);

// Label component with TypeScript types
const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block mb-1 text-sm font-medium text-gray-700">{children}</label>
);

export default CreateTicket;
