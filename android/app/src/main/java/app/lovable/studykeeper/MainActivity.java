package app.lovable.studykeeper;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StudyWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
