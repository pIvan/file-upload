import { animate, transition, trigger, style, query, stagger, AnimationTriggerMetadata } from '@angular/animations';


export const InsertAnimation: AnimationTriggerMetadata =
trigger('insertAnimation', [
    transition('* => *', [ // each time the binding value changes
        query(':leave', [
            stagger(30, [
                animate('.3s', style({ opacity: 0 }))
            ])
        ], { optional: true }),
        query(':enter', [
            style({ opacity: 0 }),
            stagger(30, [
                animate('.3s', style({ opacity: 1 }))
            ])
        ], { optional: true })
    ])
]);
