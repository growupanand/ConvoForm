import * as React from "react";
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
    Button,
    Hr,
    Link,
    Img,
    Row,
    Column,
} from "@react-email/components";

export interface FormResponseEmailProps {
    formName: string;
    responseId: string;
    respondentEmail?: string;
    responseLink: string;
    currentFieldResponses?: {
        fieldName: string;
        fieldValue: string | null;
    }[];
    transcript?: {
        role: "user" | "assistant";
        content: string;
    }[];
    metadata?: {
        userAgent?: {
            browser?: { name?: string; version?: string };
            os?: { name?: string; version?: string };
        };
        geoDetails?: {
            city?: string;
            country?: string;
        };
        submittedAt?: Date | string;
        ipAddress?: string;
    };
}

export const FormResponseEmail = ({
    formName,
    responseId,
    respondentEmail,
    responseLink,
    currentFieldResponses = [],
    transcript = [],
    metadata = {},
}: FormResponseEmailProps) => {
    const previewText = `New response for ${formName}`;
    const submittedDate = metadata.submittedAt
        ? new Date(metadata.submittedAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        })
        : null;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: {
                                    50: "#f0f9ff",
                                    100: "#e0f2fe",
                                    500: "#0ea5e9", // Sky 500
                                    900: "#0c4a6e",
                                },
                                gray: {
                                    50: "#f9fafb",
                                    100: "#f3f4f6",
                                    200: "#e5e7eb",
                                    300: "#d1d5db",
                                    400: "#9ca3af",
                                    500: "#6b7280",
                                    600: "#4b5563",
                                    700: "#374151",
                                    800: "#1f2937",
                                    900: "#111827",
                                },
                            },
                            fontFamily: {
                                sans: [
                                    "-apple-system",
                                    "BlinkMacSystemFont",
                                    '"Segoe UI"',
                                    "Roboto",
                                    '"Helvetica Neue"',
                                    "Ubuntu",
                                    "sans-serif",
                                ],
                            },
                        },
                    },
                }}
            >
                <Body className="bg-gray-50 font-sans antialiased text-gray-900 my-auto mx-auto px-2 py-10">
                    <Container className="border border-gray-200 rounded-xl mx-auto p-8 max-w-[600px] bg-white shadow-sm">
                        {/* Header */}
                        <Section className="mb-8 text-center">
                            <Heading className="text-2xl font-bold text-gray-900 mb-2">
                                New Response Received
                            </Heading>
                            <Text className="text-gray-500 text-sm m-0">
                                Form: <span className="font-semibold text-gray-700">{formName}</span>
                            </Text>
                        </Section>

                        {/* Main Content */}
                        <Section>
                            <Text className="text-base text-gray-700 leading-relaxed mb-6">
                                You have received a new submission. Here are the details of the response:
                            </Text>

                            {/* Response Details Card */}
                            <div className="bg-gray-50 rounded-lg border border-gray-100 p-1 mb-8">
                                <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <Text className="text-sm font-semibold text-gray-700 m-0">
                                            Response Summary
                                        </Text>
                                    </div>
                                    <div className="p-0">
                                        {currentFieldResponses.length > 0 ? (
                                            currentFieldResponses.map((field, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex flex-col px-4 py-3 ${index !== currentFieldResponses.length - 1
                                                        ? "border-b border-gray-50"
                                                        : ""
                                                        }`}
                                                >
                                                    <Text className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 m-0 min-w-[120px]">
                                                        {field.fieldName}
                                                    </Text>
                                                    <Text className="text-sm font-medium text-gray-900 m-0 text-left">
                                                        {field.fieldValue || "-"}
                                                    </Text>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center">
                                                <Text className="text-gray-500 italic text-sm m-0">
                                                    No structured responses collected.
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Chat Transcript */}
                            {transcript.length > 0 && (
                                <Section className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Text className="text-sm font-bold text-gray-900 uppercase tracking-wide m-0">
                                            Chat Transcript
                                        </Text>
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                    </div>

                                    {transcript.length > 10 && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-center">
                                            <Text className="text-xs text-blue-600 font-medium m-0">
                                                Showing last 10 messages of {transcript.length}. View full response to see the complete history.
                                            </Text>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {transcript.slice(-10).map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.role === "user"
                                                        ? "bg-gray-900 text-white rounded-br-sm"
                                                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                                        }`}
                                                >
                                                    <Text className="m-0">{msg.content}</Text>
                                                </div>
                                                <Text className="text-[10px] text-gray-400 mt-1 mx-1 uppercase font-medium">
                                                    {msg.role === "user" ? "User" : "Assistant"}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Metadata Section */}
                            <Section className="bg-gray-50 rounded-lg p-5 border border-dashed border-gray-200 mb-8">
                                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 m-0">
                                    Submission Metadata
                                </Text>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    {submittedDate && (
                                        <div>
                                            <Text className="text-[10px] text-gray-400 m-0">Time</Text>
                                            <Text className="text-xs text-gray-700 font-medium m-0">{submittedDate}</Text>
                                        </div>
                                    )}
                                    {metadata.geoDetails && (
                                        <div>
                                            <Text className="text-[10px] text-gray-400 m-0">Location</Text>
                                            <Text className="text-xs text-gray-700 font-medium m-0">
                                                {[metadata.geoDetails.city, metadata.geoDetails.country]
                                                    .filter(Boolean)
                                                    .join(", ") || "Unknown"}
                                            </Text>
                                        </div>
                                    )}
                                    {metadata.ipAddress && (
                                        <div>
                                            <Text className="text-[10px] text-gray-400 m-0">IP Address</Text>
                                            <Text className="text-xs text-gray-700 font-medium m-0">{metadata.ipAddress}</Text>
                                        </div>
                                    )}
                                    {metadata.userAgent && (
                                        <div>
                                            <Text className="text-[10px] text-gray-400 m-0">Device</Text>
                                            <Text className="text-xs text-gray-700 font-medium m-0 max-w-[150px] truncate">
                                                {[metadata.userAgent.browser?.name, metadata.userAgent.os?.name]
                                                    .filter(Boolean)
                                                    .join(" / ") || "Unknown"}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Section>

                            {/* CTA Button */}
                            <Section className="text-center mb-6">
                                <Button
                                    href={responseLink}
                                    className="bg-gray-900 text-white font-medium text-sm px-8 py-3 rounded-full transition-colors shadow-sm"
                                >
                                    View Full Response
                                </Button>
                            </Section>
                        </Section>
                    </Container>

                    {/* Footer */}
                    <Section className="mt-8 text-center max-w-[600px] mx-auto">
                        <Text className="text-xs text-gray-400 m-0 mb-2">
                            Sent by <Link href="https://convoform.com" className="text-gray-500 underline">ConvoForm</Link>
                        </Text>
                        <Text className="text-[10px] text-gray-300 m-0">
                            Response ID: {responseId} • Respondent: {respondentEmail || "Anonymous"}
                        </Text>
                    </Section>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default FormResponseEmail;
