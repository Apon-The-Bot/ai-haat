import React from "react";
import { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1E293B" }}>
        {statusCode ? `Error ${statusCode}` : "An error occurred on client"}
      </h1>
      <p style={{ color: "#64748B", marginTop: "8px" }}>
        {statusCode === 404
          ? "This page could not be found."
          : "An unexpected server error occurred."}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
