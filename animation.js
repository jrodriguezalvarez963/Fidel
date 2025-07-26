// Animaciones con GSAP
import { gsap } from "gsap";

export function initAnimations() {
    // Animación de entrada para las secciones
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // Animación para los elementos de curiosidades
    gsap.utils.toArray('.comic-panel').forEach((panel, i) => {
        gsap.from(panel, {
            opacity: 0,
            x: i % 2 === 0 ? -50 : 50,
            duration: 0.8,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: panel,
                start: 'top 90%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // Animación para los libros en la sección de análisis
    gsap.utils.toArray('.book-card').forEach((card, i) => {
        gsap.from(card, {
            opacity: 0,
            y: 30,
            rotation: -5,
            duration: 0.7,
            delay: i * 0.15,
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // Animación de elementos mexicanos
    gsap.utils.toArray('.mexico-frame').forEach(frame => {
        gsap.from(frame, {
            opacity: 0,
            scale: 0.8,
            duration: 0.8,
            scrollTrigger: {
                trigger: frame,
                start: 'top 90%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // Animación de flotación para elementos mexicanos
    gsap.utils.toArray('.alebrije').forEach(alebrije => {
        gsap.to(alebrije, {
            y: 20,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });
    
    // Animación para la estrella revolucionaria
    const star = document.querySelector('.star-animation');
    if (star) {
        gsap.to(star, {
            rotation: 360,
            duration: 15,
            repeat: -1,
            ease: "none"
        });
    }
}