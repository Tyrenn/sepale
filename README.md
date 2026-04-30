* `Source Tailwind` -> Équivalent CSS
* `@apply inline-flex shrink-0 …` -> Propriétés CSS explicites
* `@apply no-underline` -> text-decoration: none
* `@apply appearance-none` -> appearance: none
* `@apply rounded-full px-0` -> border-radius: 9999px + padding-inline: 0
* `@apply w-full max-w-64` -> width: 100% + max-width: 16rem
* `@apply bg-base-content/10` -> color-mix(in oklch, var(--color-base-content) 10%, #0000)





* Avatar
* Badge => Rename to chip
* Indicator => Badge
* Table but with grid
* Breadcrumbs
* Dock
* Link
* Join
* Tab
* Loading
* Progress
* Radial progress
* Skeleton
* Checkbox (add square)
* Fieldset
* FileInput
* Radio
* Range
* Select
* Input (add the suggestion ?)
* Textarea
* Toggle
* Validator

* Mask ?


* Label => To InsideLabel and FloatingLabel

To review
* Step but from our
* Toast 
* Calendar




Toggle  
	* Version sans bordure ? avec le thumb plus gros

Range
	* Similaire aux versions de toggle

Checkbox
	* Rendre le off fluide avec une transition plutôt qu'une animation
	* Possibilité de mettre une svg en temps que check ?

x Comment faire pour rendre l'ouverture du select plus fluide (animation/transition ?)
> Pas possible sans un select special
x Idem pour un input qui aurait une liste de suggestion, ajouter le composant list pour pouvoir les join

Actuellement les classes sont cools mais opiniatre, il y a un modèle par défaut qui oblige, même si on a un thème complet, à renseigner certaines classes à chaque fois.
Aucun moyen à partir du thème d'appliquer par défaut des variantes. Par exemple le thème ne permet pas de dire "tous les toggles ont un track par défaut"
Comment faire ? Proposer des solutions avec leur défaut et avantage en plus d'explorer celles-ci:
- Plusieurs pack de css
- Conserver ce fonctionnement