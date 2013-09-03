import App from "application";
import DragHandleComponent from "components/drag_handle";
import PropertyFieldComponent from "components/property_field";
import Port from "port";

var EmberExtension;

EmberExtension = App.create();
EmberExtension.DragHandleComponent = DragHandleComponent;
EmberExtension.PropertyFieldComponent = PropertyFieldComponent;
EmberExtension.Port = Port;

export default EmberExtension;
