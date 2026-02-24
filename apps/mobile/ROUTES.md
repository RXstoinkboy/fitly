/(tabs)
    _layout
    home --> protected -> isOnboarded
    gallery --> protected -> isOnboarded
/onboarding
    _layout
    welcome --> protected -> !isOnboarded
    second-page --> protected -> !isOnboarded
    third-page --> protected -> !isOnboarded
settings --> protected -> isOnboarded
_layout - main layout with initialization code and stack definition
    - it should render `select-clothes` drawer under the stack with buttons and `recent clothes` gallery
    - `image-modal-zoom-in` (OR protected if rendered as route under (tabs) -> isOnboarded (if I can render it on top of other routes in the same time but with translucent background))
index - stack definition?? or not needed at all or just <Slot>?
+not-found