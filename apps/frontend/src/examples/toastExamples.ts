// Toast Usage Examples
// Import the toast function anywhere in your application

import { toast } from "../components/Toast/toastService";

// Basic usage with default type (info)
toast("This is an info message");

// Using specific types
toast("Operation successful!", "success");
toast("Something went wrong!", "error");
toast("Please be careful!", "warning");
toast("Here's some information", "info");

// Or use the convenience methods
toast.success("Profile updated successfully!");
toast.error("Failed to save changes");
toast.warning("Your session will expire soon");
toast.info("New feature available!");

// Example in a real component:
/*
import { toast } from "../../components/Toast/toastService";

const MyComponent = () => {
  const handleSave = async () => {
    try {
      // Your save logic
      toast.success("Document saved successfully!");
    } catch (error) {
      toast.error("Failed to save document");
    }
  };

  return (
    <button onClick={handleSave}>
      Save
    </button>
  );
};
*/
