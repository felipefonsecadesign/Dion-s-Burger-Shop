// This is a PUBLIC anon key, not a service-role key. Database roles deny all
// direct customer-table access. JWT verification remains enabled on the function.
export const customerEndpoint =
  "https://zvndirwhvuiyebulmkfi.supabase.co/functions/v1/capture-customer";
export const customerPublicKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bmRpcndodnVpeWVidWxta2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzkxNTQsImV4cCI6MjEwNzc1NTE1NH0.Gk3ui0Bgrp3BBlE2fE4OVeHSsuhhhB7IrUrIXT0wt3k";
