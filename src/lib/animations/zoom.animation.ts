import { animate, transition, trigger, style, query, stagger } from '@angular/animations';


export const ZoomAnimation =
trigger('zoomAnimation', [
    transition('static => zoomOut', [
        animate(250, style({ transform: 'translate(-50%, -50%) scale(2, 2)', opacity: 0 })),
    ]),
    transition('static => zoomIn', [
        query(':self', [
            style({ transform: 'translate(-50%, -50%) scale(.2, .2)', opacity: 0, top: '50%', left: '50%', margin: 0 }),
            stagger(50, [
                animate(250, style({ transform: 'translate(-50%, -50%) scale(1, 1)', opacity: 1 }))
            ])
        ])
    ])
]);
